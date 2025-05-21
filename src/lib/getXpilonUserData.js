import { auth } from "@/auth"
import prisma from '@/db'

async function getUser(userId) {
  if (!userId) {
    return null;
  }

  const user = (await prisma.user.findUnique({
    where: { id: userId },
  }));


  return user;
}


function setDefault(xpuser) {

  if(!xpuser.name){ //se non c'è prendo il dome dalla mail
    if(xpuser.email){
      xpuser.name=xpuser.email.split("@")[0];
    }
  }

  if(!xpuser.backgroundImage){
    xpuser.backgroundImage=process.env.DEFAULT_BACKGROUND_IMAGE; 
  }

  if(xpuser.companies){
      xpuser.companies.forEach(companies => {
        if(!companies?.company?.logoUrl){
          //companies.company.logoUrl="/api/logoGen?width=350&height=233&message="+encodeURIComponent("Upload your Logo")+"&text="+encodeURIComponent(companies.company.companyName)+"&time="+(Date.now());
        }

      });
  }
}

export default async function getXpilonSessionFull(userId) {
  if(!userId){ //se non viene passato l'id utente prendo quello della sessione
    const session = await auth();
    if(!session){
      return null;
    }
    userId=session.user.id;
  }
  const xpuser= await getUser(userId);
  xpuser && setDefault(xpuser);
  return xpuser ;

}

