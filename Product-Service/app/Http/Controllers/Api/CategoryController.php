<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json(['success' => true, 'data' => $categories], 200);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description
        ]);

        return response()->json(['success' => true, 'message' => 'Kategori berhasil dibuat', 'data' => $category], 201);
    }

    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Tidak ditemukan'], 404);
        
        return response()->json(['success' => true, 'data' => $category], 200);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Tidak ditemukan'], 404);

        $category->update($request->all());
        return response()->json(['success' => true, 'message' => 'Kategori berhasil diupdate', 'data' => $category], 200);
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Tidak ditemukan'], 404);

        $category->delete();
        return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus'], 200);
    }
}