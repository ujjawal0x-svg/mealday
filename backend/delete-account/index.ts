import {createClient} from "npm:@supabase/supabase-js@2.118.0";
const origin="https://mealday-kitchen-app.jauntycomet1.chatgpt.site";
const headers={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization, apikey, content-type, x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers});
 const respond=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,"Content-Type":"application/json"}});
 if(req.method!=="POST")return respond({error:"Method not allowed"},405);
 const token=req.headers.get("Authorization")?.replace(/^Bearer /,"");if(!token)return respond({error:"Sign in required"},401);
 const url=Deno.env.get("SUPABASE_URL")!;
 const userClient=createClient(url,Deno.env.get("SUPABASE_ANON_KEY")!);
 const {data:{user},error}=await userClient.auth.getUser(token);
 if(error||!user)return respond({error:"Session invalid"},401);
 let body;try{body=await req.json()}catch{return respond({error:"Invalid request"},400)}
 if(body.confirm!=="DELETE")return respond({error:"Confirmation required"},400);
 const admin=createClient(url,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
 // Delete the authenticated account only. FK cascade removes the private snapshot.
 const revoked=await admin.auth.admin.signOut(token,"global");
 if(revoked.error)return respond({error:"Could not revoke sessions. Please retry."},500);
 const result=await admin.auth.admin.deleteUser(user.id);
 if(result.error)return respond({error:"Could not delete account. Please sign in and retry."},500);
 return respond({deleted:true});
});
