<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class UpdateEquipmentCategoryRequest extends FormRequest { public function authorize():bool{return $this->user()?->hasRole('admin')??false;} public function rules():array{return ['name'=>'required|string|max:255','code'=>['required','string','max:50',Rule::unique('equipment_categories','code')->ignore($this->route('category'))],'description'=>'nullable|string'];} }
