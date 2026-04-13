<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class NewsController extends Controller
{
    public function publicIndex()
    {
        $news = News::where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $news
        ], 200);
    }

    public function publicShow($slug)
    {
        $news = News::where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (!$news) {
            return response()->json(['success' => false, 'message' => 'Berita tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $news
        ], 200);
    }

    public function index(Request $request)
    {
        $news = News::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $news
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $title = $request->input('title');
        $content = $request->input('content');
        $status = $request->input('status');

        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (News::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = 'news-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/news');
            
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $filename);
            $imageUrl = '/uploads/news/' . $filename;
        }

        $news = News::create([
            'title' => $title,
            'slug' => $slug,
            'content' => $content,
            'status' => $status,
            'image' => $imageUrl
        ]);

        return response()->json([
            'success' => true,
            'data' => $news
        ], 201);
    }

    public function show($id)
    {
        $news = News::find($id);

        if (!$news) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $news
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $news = News::find($id);

        if (!$news) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'required|in:draft,published',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $title = $request->input('title');
        $content = $request->input('content');
        $status = $request->input('status');

        $slug = Str::slug($title);
        if ($slug !== $news->slug) {
            $originalSlug = $slug;
            $counter = 1;
            while (News::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            $news->slug = $slug;
        }

        if ($request->hasFile('image')) {
            if ($news->image) {
                $oldImagePath = public_path($news->image);
                if (File::exists($oldImagePath)) {
                    File::delete($oldImagePath);
                }
            }

            $file = $request->file('image');
            $filename = 'news-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/news');
            
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $filename);
            $news->image = '/uploads/news/' . $filename;
        }

        $news->title = $title;
        $news->content = $content;
        $news->status = $status;
        $news->save();

        return response()->json([
            'success' => true,
            'data' => $news
        ], 200);
    }

    public function destroy($id)
    {
        $news = News::find($id);

        if (!$news) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        }

        if ($news->image) {
            $imagePath = public_path($news->image);
            if (File::exists($imagePath)) {
                File::delete($imagePath);
            }
        }

        $news->delete();

        return response()->json(['success' => true], 200);
    }
}