<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class GalleryController extends Controller
{
    public function index()
    {
        $galleries = Gallery::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $galleries
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $file = $request->file('image');
        $filename = 'gal-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        $destinationPath = public_path('uploads/gallery');
        if (!File::exists($destinationPath)) {
            File::makeDirectory($destinationPath, 0755, true);
        }
        
        $file->move($destinationPath, $filename);
        $imageUrl = '/uploads/gallery/' . $filename;

       $gallery = Gallery::create([
            'title' => $request->title,
            'image_url' => $imageUrl 
        ]);

        return response()->json([
            'success' => true,
            'data' => $gallery
        ], 201);
    }

    public function destroy($id)
    {
        $gallery = Gallery::find($id);

        if (!$gallery) {
            return response()->json([
                'success' => false,
                'message' => 'Foto tidak ditemukan'
            ], 404);
        }

        $imagePath = public_path($gallery->imageUrl);
        if (File::exists($imagePath)) {
            File::delete($imagePath);
        }

        $gallery->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil dihapus'
        ], 200);
    }
}