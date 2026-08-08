<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class StoreMaintenanceRequest extends FormRequest { public function authorize():bool{return $this->user()?->hasAnyRole(['admin','teacher','student'])??false;} public function rules():array{return ['equipment_id'=>'required|exists:equipment,id','issue_description'=>'required|string|max:2000'];} }
