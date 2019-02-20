# frozen_string_literal: true

require "rspec_api_documentation/dsl"
Rails.root.join("spec/acceptance/concerns").each_child { |path| require_dependency(path) }

RSpec.resource "key_results", warden: true do
  include OrganizationDataset
  include RequestHeaderJson

  before do
    key_result
    other_key_result

    login_as(nomal_user)
  end

  get "/key_results/candidates" do
    parameter :user_id, "サインインユーザと同じ組織のユーザーID", type: :integer
    parameter :okr_period_id, "取得したいOKR期間のID", type: :integer, required: true

    example "SUCCESS: When specifying user_id" do
      explanation "user_idを渡す場合、それがサインインユーザと同じ組織のユーザであれば、OKR期間のKeyResults一覧の概要を取得することができる"

      do_request(
        user_id: admin_user.id,
        okr_period_id: okr_period.id
      )

      expect(response_status).to eq(200)

      key_results = parse_response_body
      expect(key_results.size).to eq(1)
      expect(key_results.first).to include(
        "id" => a_kind_of(Integer),
        "name" => "イケてるエンジニアを採用する",
        "progress_rate" => 0,
        "status" => "green",
        "disabled" => false,
        "owner" => {
          "id" => a_kind_of(Integer),
          "first_name" => "太郎",
          "last_name" => "山田",
          "avatar_url" => nil,
          "disabled" => false
        },
        "members" => []
      )
    end

    example "SUCCESS: When user_id is not specified" do
      explanation "user_idを渡さない場合、サインインユーザのOKR期間のKeyResults一覧の概要を取得することができる"

      do_request(
        user_id: nil,
        okr_period_id: okr_period.id
      )

      expect(response_status).to eq(200)

      key_results = parse_response_body
      expect(key_results.size).to eq(2)

      # 最近作られたKeyResultが先頭にくる
      expect(key_results.dig(0, "name")).to eq("正式版をリリースする")
      expect(key_results.dig(1, "name")).to eq("イケてるエンジニアを採用する")
    end

    example "ERROR: When the user_id passed is an organization different from the sign-in user" do
      explanation "渡したuser_idがサインインユーザとは異なる組織である場合、403 forbiddenを返す"

      do_request(
        user_id: other_org_user.id,
        okr_period_id: okr_period.id
      )

      expect(response_status).to eq(403)
      expect(parse_response_error).to eq(["許可されていない操作です"])
    end
  end
end