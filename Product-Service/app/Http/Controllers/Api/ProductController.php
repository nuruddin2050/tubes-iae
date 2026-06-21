<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    // 1. GET ALL PRODUCTS (Read All)
    public function index()
    {
        $products = Product::with('category')->get();
        return response()->json([
            'success' => true,
            'message' => 'Daftar Produk Kemasan Organik',
            'data'    => $products
        ], 200);
    }

    // 2. POST NEW PRODUCT (Create)
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|integer',
            'stock'       => 'required|integer',
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name'        => $request->name,
            'slug'        => Str::slug($request->name) . '-' . rand(1000, 9999),
            'description' => $request->description,
            'price'       => $request->price,
            'stock'       => $request->stock,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan',
            'data'    => $product
        ], 201);
    }

    // 3. GET SINGLE PRODUCT (Read Detail)
    public function show($id)
    {
        $product = Product::with('category')->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Produk',
            'data'    => $product
        ], 200);
    }

    // 4. PUT/PATCH PRODUCT (Update)
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name'        => 'sometimes|required|string|max:255',
            'price'       => 'sometimes|required|integer',
            'stock'       => 'sometimes|required|integer',
        ]);

        // Jika nama berubah, slug diupdate
        if ($request->has('name')) {
            $product->slug = Str::slug($request->name) . '-' . rand(1000, 9999);
        }

        $product->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diupdate',
            'data'    => $product
        ], 200);
    }

    // 5. DELETE PRODUCT (Delete)
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus'
        ], 200);
    }
}