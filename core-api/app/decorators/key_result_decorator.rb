# frozen_string_literal: true

module KeyResultDecorator
  def achievement_rate
    if target_value.present? && actual_value.present? && target_value > 0
      (actual_value * 100 / target_value).round
    end
  end

  def progress_rate_connected?
    !child_objectives.empty? && progress_rate_in_database.nil? # 子 Objective を持ち進捗率が未設定の場合は true
  end

  def connected_objectives(objectives = [], connected_objective = objective)
    objectives.push(connected_objective)
    parent_key_result = connected_objective.parent_key_result
    if parent_key_result&.progress_rate_connected?
      return connected_objectives(objectives, parent_key_result.objective)
    end

    objectives
  end

  def detached_objective
    if saved_change_to_objective_id? && objective_id_before_last_save
      Objective.find(objective_id_before_last_save)
    end
  end

  def descendant_objectives(objectives = [])
    objectives.concat(child_objectives)
    child_objectives.each do |objective|
      objective.descendant_objectives(objectives)
    end
    objectives
  end

  def sorted_child_objective_ids
    sorted_child_objectives.map(&:id)
  end

  def sorted_child_objectives
    child_objectives.includes(:parent_key_result).sort_by do |objective|
      owner_id = objective.owner.id
      role = objective.parent_key_result.key_result_members.find_by(user_id: owner_id).role_before_type_cast
      [role, owner_id] # 責任者/関係者順 → ユーザー順 (→ 作成日昇順)
    end
  end

  def processed?(operator)
    key_result_member = key_result_members.find_by(user_id: operator.id)
    key_result_member.nil? ? true : key_result_member.processed # 関連付いていない KR は処理済みとみなす
  end
end