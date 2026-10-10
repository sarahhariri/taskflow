<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::orderBy('id', 'desc')->get();

        return response()->json([
            'data' => $tasks,
        ]);
    }

    public function store(Request $request)
{
    $data = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'customer_name' => ['nullable', 'string', 'max:255'],
        'description' => ['nullable', 'string', 'max:5000'],
        'due_date' => ['nullable', 'date_format:Y-m-d'],
    ]);

    $data['status'] = 'new';

    $task = Task::create($data);

    return response()->json([
        'data' => $task->fresh(),
    ], 201);
}
public function update(Request $request, Task $task)
{
    $data = $request->validate([
        'title' => ['sometimes', 'required', 'string', 'max:255'],
        'customer_name' => ['sometimes', 'nullable', 'string', 'max:255'],
        'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
        'due_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        'status' => [
            'sometimes',
            'required',
            'in:new,in_progress,completed',
        ],
    ]);

    $task->update($data);

    return response()->json([
        'data' => $task->fresh(),
    ]);
}
public function destroy(Task $task)
{
    $task->delete();

    return response()->json([
        'message' => 'Task deleted successfully.',
    ]);
}
}