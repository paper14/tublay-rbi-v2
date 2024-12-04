<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Models\Record;
use Inertia\Inertia;
use Inertia\Response;

class RecordsController extends Controller
{
    public function index()
    {   
        // return Inertia::render('Records');
        return Inertia::render('Records', [
            'NID_PUBLIC_API_KEY' => env("NID_PUBLIC_API_KEY")
        ]);
    }

    public function search(Request $request){

        if($request->suffix == ''){
            $request['suffix'] = 'N/A';
        }

        $dataRes = Record::where([
            ['first_name', '=', $request->first_name],
            ['middle_name', '=', $request->middle_name],
            ['last_name', '=', $request->last_name],
            ['extension', '=', $request->suffix],
            ['date_of_birth', '=', $request->birth_date]
        ])->first();
        if($dataRes){
            if($dataRes['extension'] == 'N/A'){
                $dataRes['extension'] = "";
            }
        }
        return $dataRes;
    }

    public function store(Request $request)
    {
        // User::create($request->validate([
        //   'first_name' => ['required', 'max:50'],
        //   'last_name' => ['required', 'max:50'],
        //   'email' => ['required', 'max:50', 'email'],
        // ]));

        // return to_route('users.index');
    }

    public function validate(Request $request){
        $authorizeResponse = Http::post('https://ws.everify.gov.ph/api/auth', [
            'client_id' => env("NID_CLIENT_ID"),
            'client_secret' => env("NID_CLIENT_SECRET")
        ]);

        if(json_decode($authorizeResponse)->data->access_token){
            $queryResponse = Http::withToken(json_decode($authorizeResponse)->data->access_token)->post('https://ws.everify.gov.ph/api/query',[
                "first_name" => $request->first_name,
                "middle_name" => $request->middle_name,
                "last_name" => $request->last_name,
                "suffix" => $request->suffix,
                "birth_date" =>  $request->birth_date,
                "face_liveness_session_id" => $request->face_liveness_session_id
            ]);
            return json_decode($queryResponse)->data;
        }
        

        
    }
}
