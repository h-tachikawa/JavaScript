# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180724102832) do

  create_table "comments", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.integer "key_result_id", null: false
    t.integer "user_id", null: false
    t.text "text", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key_result_id"], name: "index_comments_on_key_result_id"
  end

  create_table "group_members", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.integer "group_id", null: false
    t.integer "user_id", null: false
    t.integer "role", limit: 1, default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "groups", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "organization_id", null: false
    t.string "name", null: false
  end

  create_table "key_result_members", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.integer "key_result_id", null: false
    t.integer "user_id", null: false
    t.integer "role", limit: 1, default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "processed", default: false, null: false
    t.index ["key_result_id"], name: "index_key_result_members_on_key_result_id"
  end

  create_table "key_results", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.string "name", null: false
    t.integer "objective_id", null: false
    t.integer "okr_period_id", null: false
    t.integer "progress_rate"
    t.float "target_value", limit: 24
    t.float "actual_value", limit: 24
    t.string "value_unit"
    t.date "expired_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.string "result"
    t.integer "sub_progress_rate"
    t.integer "status", limit: 1, default: 0, null: false
    t.index ["created_at"], name: "index_key_results_on_created_at"
    t.index ["objective_id"], name: "index_key_results_on_objective_id"
  end

  create_table "objective_members", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.integer "objective_id", null: false
    t.integer "user_id", null: false
    t.integer "role", limit: 1, default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["objective_id"], name: "index_objective_members_on_objective_id"
    t.index ["user_id"], name: "index_objective_members_on_user_id"
  end

  create_table "objective_orders", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.integer "user_id", null: false
    t.integer "okr_period_id", null: false
    t.string "list"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "objectives", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.string "name", null: false
    t.text "description"
    t.integer "parent_key_result_id"
    t.integer "okr_period_id", null: false
    t.integer "progress_rate"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "key_result_order"
    t.integer "sub_progress_rate"
    t.index ["created_at"], name: "index_objectives_on_created_at"
    t.index ["parent_key_result_id"], name: "index_objectives_on_parent_key_result_id"
  end

  create_table "okr_periods", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "organization_id", null: false
    t.date "month_start", null: false
    t.date "month_end", null: false
    t.string "name"
    t.index ["organization_id"], name: "index_okr_periods_on_organization_id"
  end

  create_table "organization_members", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "organization_id", null: false
    t.integer "user_id", null: false
    t.integer "role", limit: 1, default: 1, null: false
    t.index ["organization_id", "user_id"], name: "index_organization_members_on_organization_id_and_user_id", unique: true
    t.index ["user_id"], name: "index_organization_members_on_user_id"
  end

  create_table "organizations", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", null: false
    t.string "logo"
    t.integer "okr_span", default: 3, null: false
  end

  create_table "user_settings", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.integer "user_id", null: false
    t.boolean "show_child_objectives", default: true
    t.boolean "show_objective_key_results", default: true
    t.boolean "show_member_key_results", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4" do |t|
    t.string "last_name", null: false
    t.string "first_name", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "admin", default: false
    t.string "avatar"
    t.integer "current_organization_id"
    t.boolean "disabled", default: false
    t.datetime "disabled_at"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

end
