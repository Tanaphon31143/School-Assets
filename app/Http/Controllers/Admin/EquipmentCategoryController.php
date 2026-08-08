<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EquipmentCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Requests\StoreEquipmentCategoryRequest;
use App\Http\Requests\UpdateEquipmentCategoryRequest;

class EquipmentCategoryController extends Controller
{
    public function index()
    {
        $categories = EquipmentCategory::withCount('equipment')->latest()->paginate(15);
        return view('admin.categories.index', compact('categories'));
    }

    public function create() { return view('admin.categories.create'); }

    public function store(StoreEquipmentCategoryRequest $request)
    {
        $data = $request->validated();
        EquipmentCategory::create($data);
        return redirect()->route('admin.categories.index')->with('success','เพิ่มประเภทครุภัณฑ์แล้ว');
    }

    public function edit(EquipmentCategory $category) { return view('admin.categories.edit', compact('category')); }

    public function update(UpdateEquipmentCategoryRequest $request, EquipmentCategory $category)
    {
        $data = $request->validated();
        $category->update($data);
        return redirect()->route('admin.categories.index')->with('success','แก้ไขประเภทครุภัณฑ์แล้ว');
    }

    public function destroy(EquipmentCategory $category)
    {
        if ($category->equipment()->exists()) return back()->with('error','ไม่สามารถลบประเภทที่มีครุภัณฑ์อยู่ได้');
        $category->delete();
        return back()->with('success','ลบประเภทครุภัณฑ์แล้ว');
    }
}
