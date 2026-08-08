<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreBorrowingRequest extends FormRequest { public function authorize():bool{return $this->user()?->hasAnyRole(['admin','teacher','student'])??false;} public function rules():array{return ['equipment_id'=>'required|exists:equipment,id','quantity'=>'required|integer|min:1','expected_return_date'=>'required|date|after_or_equal:today','purpose'=>'nullable|string|max:1000'];} }
