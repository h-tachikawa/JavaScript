json.objective do
  json.partial!(@objective)

  json.parent_objective do
    json.partial!(@objective.parent_objective) if @objective.parent_objective
  end

  parent_key_result = @objective.parent_key_result
  json.parent_key_result do
    json.partial! 'key_results/progress_rate', key_result: parent_key_result if parent_key_result
  end

  detached_parent_key_result = @objective.detached_parent_key_result
  json.detached_parent_key_result do
    json.partial! 'key_results/progress_rate', key_result: detached_parent_key_result if detached_parent_key_result
  end
end
