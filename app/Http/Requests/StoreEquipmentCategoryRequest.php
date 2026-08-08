<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreEquipmentCategoryRequest extends FormRequest { public function authorize():bool{return $this->user()?->hasRole('admin')??false;} public function rules():array{return ['name'=>'required|string|max:255','code'=>'required|string|max:50|unique:equipment_categories,code','description'=>'nullable|string'];} }
