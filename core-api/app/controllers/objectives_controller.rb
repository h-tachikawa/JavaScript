# frozen_string_literal: true

class ObjectivesController < ApplicationController
  def index
    if params[:user_id].present?
      @user = User.find(params[:user_id])
      forbidden and return unless valid_permission?(@user.organization.id)

      objectives = @user.objectives
                         .includes(:key_results)
                         .where(okr_period_id: params[:okr_period_id])
                         .order(created_at: :desc)

      all_abjectives = current_user.admin? ?
                                   Objective
                                     .includes(:key_results)
                                     .where(okr_period_id: params[:okr_period_id])
                                     .order(created_at: :desc)
                                   : {}

      objective_order = @user.objective_orders.find_by(okr_period_id: params[:okr_period_id])&.list
      @objectives = sort_objectives(objectives, objective_order)
      @all_objectives = sort_objectives(all_abjectives, objective_order)
    else
      @objectives = current_organization
                    .okr_periods
                    .find(params[:okr_period_id])
                    .objectives
                    .order(created_at: :desc)
    end
  end

  def index_candidates
    index
  end

  def show
    @objective = Objective.find(params[:id])
    forbidden and return unless valid_permission?(@objective.owner.organization.id)
  end

  def create
    @user = User.find(params[:objective][:owner_id])
    forbidden and return unless valid_permission?(@user.organization.id)

    ActiveRecord::Base.transaction do
      @objective = @user.objectives.new(objective_create_params)
      @user.save!
      update_parent_key_result if params[:objective][:parent_key_result_id]
      if params[:objective][:department_id]
        @department = Department.find(params[:objective][:department_id])
        DepartmentObjective.create!(
          department_id: @department.id,
          objective_id: @objective.id
        )
      end
    end
    render status: :created
  rescue StandardError
    unprocessable_entity_with_errors(@objective.errors.full_messages)
  end

  def create_copy
    @user = User.find(params[:objective][:owner_id])
    forbidden and return unless valid_permission?(@user.organization.id)

    ActiveRecord::Base.transaction do
      original_objective = Objective.find(params[:id])
      @objective = @user.objectives.new(objective_create_params)
      @user.save!
      update_parent_key_result if params[:objective][:parent_key_result_id]

      # KR をコピー
      expired_date = @objective.okr_period.end_date
      original_objective.sorted_key_results.each do |original_key_result|
        key_result = @objective.key_results.create!(
          name: original_key_result.name,
          description: original_key_result.description,
          target_value: original_key_result.target_value,
          value_unit: original_key_result.value_unit,
          expired_date: expired_date
        )
        original_key_result.key_result_members.each do |member|
          key_result.key_result_members.create!(user_id: member.user_id, role: member.role)
        end
      end
    end
    render action: :create, status: :created
  rescue StandardError
    unprocessable_entity_with_errors(@objective.errors.full_messages)
  end

  def update
    @objective = Objective.find(params[:id])
    forbidden and return unless valid_permission?(@objective.owner.organization.id)

    ActiveRecord::Base.transaction do
      update_parent_key_result if params[:objective][:parent_key_result_id] # 再帰構造による無限ループ回避のため update! より先に処理する
      @objective.update!(objective_update_params)
      update_objective_members if params[:objective][:objective_member]
      update_comment if params[:objective][:comment]
    end
    render action: :create, status: :ok
  rescue StandardError
    unprocessable_entity_with_errors(@objective.errors.full_messages)
  end

  def update_disabled
    @objective = Objective.find(params[:id])
    forbidden and return unless valid_permission?(@objective.owner.organization.id)
    forbidden("Objective 責任者のみ編集できます") and return unless valid_user?(@objective.owner.id)

    disabled = params[:disabled]
    unless @objective.update_attribute(:disabled_at, disabled ? Time.current : nil)
      unprocessable_entity_with_errors(@objective.errors.full_messages)
    end
    @objective.reload # 変更前の進捗率が返るためクエリキャッシュをクリア
  end

  def destroy
    @objective = Objective.find(params[:id])
    forbidden and return unless valid_permission?(@objective.owner.organization.id)
    forbidden("Objective 責任者のみ削除できます") and return unless valid_user?(@objective.owner.id)

    if @objective.destroy
      render action: :create, status: :ok
    else
      unprocessable_entity_with_errors(@objective.errors.full_messages)
    end
  end

  def history
    runner(Objective::History, id: params[:id]) do |result|
      render json: {
        histories: ActiveModel::Serializer::CollectionSerializer.new(result[:histories], serializer: ObjectiveVersionSerializer)
      }, status: :ok
    end
  end

  private

    def update_parent_key_result
      parent_key_result = KeyResult.find(params[:objective][:parent_key_result_id])
      unless can_update_parent_key_result?(parent_key_result)
        @objective.errors[:base] << "この Objective または下位 Objective に紐付く Key Result は上位 Key Result に指定できません"
        raise
      end

      objective_owner_id = @objective.owner.id
      if parent_key_result.key_result_members.exists?(user_id: objective_owner_id)
        # Objective 責任者が紐付ける上位 KR の責任者または関係者の場合
        is_member = parent_key_result.key_result_members.exists?(user_id: current_user.id, role: :member)
        if !current_user.admin? && is_member && objective_owner_id != current_user.id
          @objective.errors[:base] << "上位 Key Result の関係者は Objective 責任者に自分以外を指定できません"
          raise
        end
        parent_key_result.key_result_members.find_by(user_id: objective_owner_id).update!(processed: true)
      else
        if current_user.admin? || parent_key_result.owner.id == current_user.id
          # 管理者または上位 KR 責任者の場合は上位 KR の関係者として追加する
          parent_key_result.key_result_members.create!(user_id: objective_owner_id, role: :member, processed: true)
        else
          @objective.errors[:base] << "上位 Key Result の責任者または関係者でないため紐付けられません"
          raise
        end
      end
    end

    def can_update_parent_key_result?(parent_key_result)
      return true unless parent_key_result

      parent_objective = parent_key_result.objective
      return false if parent_objective.id == @objective.id # 親 Objective が自分の場合は循環参照になるため false

      can_update_parent_key_result?(parent_objective.parent_key_result)
    end

    def update_objective_members
      objective_member_data = params[:objective][:objective_member]
      user_id = objective_member_data["user"]

      # 責任者の変更 (前の owner を削除する)
      owner = @objective.objective_members.find_by(role: :owner)
      owner.destroy!

      member = @objective.objective_members.find_by(user_id: user_id)
      if member.nil?
        @objective.objective_members.create!(user_id: user_id, role: :owner)
      else
        # 関係者から責任者に変更
        member.update!(role: :owner)
      end

      # Objective 責任者が紐付く上位 KR の責任者または関係者でない場合は追加する
      if @objective.parent_key_result && !@objective.parent_key_result.key_result_members.exists?(user_id: user_id)
        @objective.parent_key_result.key_result_members.create!(user_id: user_id, role: :member, processed: true)
      end
    end

    def sort_objectives(objectives, objective_order)
      return objectives unless objective_order

      order = JSON.parse(objective_order)
      index = 0
      # Objective 一覧を objective_order 順に並べる (順番のない O は前に並べていく)
      objectives.sort_by { |objective| order.index(objective.id) || index - 1 }
    end

    def objective_create_params
      params.require(:objective)
            .permit(:name, :description, :parent_key_result_id, :okr_period_id)
    end

    def objective_update_params
      params.require(:objective)
            .permit(:name, :description, :parent_key_result_id, :progress_rate, :key_result_order, :result)
    end

    def update_comment
      comment_data = params[:objective][:comment]

      case comment_data["behavior"]
      when "add"
        @objective.objective_comments.create!(
          text: comment_data["data"],
          user_id: current_user.id
        )
      when "edit"
        data = comment_data["data"]
        comment = @objective.objective_comments.find(data["id"])
        comment.update(text: data[:text])
      when "remove"
        comment = @objective.objective_comments.find(comment_data["data"])
        comment.destroy!
      when "update_show_meeting_board"
        data = comment_data["data"]
        comment = @objective.objective_comments.find(data["id"])
        comment.update!(show_meeting_board: data[:show_meeting_board])
      end
    end
end