import bcrypt from 'bcrypt'

export const hashPassword = async (contrasena:string) =>{
    const salt =await bcrypt.genSalt(10)
    return await bcrypt.hash(contrasena,salt)

}
export const checkcontrasena =async (Contrasena:string, hash:string)=>{
  return await bcrypt.compare(Contrasena,hash)
}