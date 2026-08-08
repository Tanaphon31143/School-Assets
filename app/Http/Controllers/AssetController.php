<?php
namespace App\Http\Controllers;
use App\Models\Equipment;
use App\Models\EquipmentBorrowing;
use Illuminate\Http\Request;
class AssetController extends Controller { public function dashboard(){ $stats=['total'=>Equipment::sum('quantity'),'available'=>Equipment::where('status','available')->count(),'borrowed'=>Equipment::where('status','borrowed')->count(),'maintenance'=>Equipment::whereIn('status',['maintenance','damaged'])->count()]; $recentBorrowings=EquipmentBorrowing::with(['equipment','borrower'])->latest()->limit(5)->get(); return view('dashboard',compact('stats','recentBorrowings')); } public function index(Request $request){$equipment=Equipment::with(['category','location'])->when($request->search,fn($q,$v)=>$q->where(fn($x)=>$x->where('name','like',"%$v%")->orWhere('code','like',"%$v%")))->when($request->status,fn($q,$v)=>$q->where('status',$v))->latest()->paginate(12)->withQueryString();return view('equipment.index',compact('equipment'));} public function show(Equipment $equipment){return view('equipment.show',compact('equipment'));} public function publicShow(Equipment $equipment){return view('equipment.public-show',compact('equipment'));} }
