import supabase, { supabaseUrl } from "./supabase";

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getCurrentUser() {
  const { data: session, error } = await supabase.auth.getSession();
  if (!session.session) return null;
  if (error) throw new Error(error.message);
  return session.session?.user;
}

export async function signup({name, email, password, profile_pic}) {
    const fileName = `dp-${name.split(" ").join("-")}-${Math.random()}`;
  
    const {error: storageError} = await supabase.storage
      .from("profile_pic")
      .upload(fileName, profile_pic);
  
    if (storageError) throw new Error(storageError.message);
  
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          profile_pic: `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`,
        },
      },
    });
  
    if (error) throw new Error(error.message);
        // 3. Insert into profiles table
        const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,         // Use the auth user's ID as the profile ID
          email: email,
          full_name: name,
          profile_pic_url: `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`,
        });
  
      if (profileError) {
        // If profile creation fails, you might want to clean up the auth user
        // and uploaded image, but that depends on your requirements
        throw new Error(profileError.message);
      }
  
    return data;
  }


  export async function logout(){
    const {error}= await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
