<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
class ActivityLogController extends Controller { public function index(Request $request){$activities=Activity::with('causer')->when($request->search,fn($q,$v)=>$q->where('description','like',"%$v%")->orWhere('subject_type','like',"%$v%"))->latest()->paginate(25)->withQueryString();return view('admin.activity.index',compact('activities'));} }
