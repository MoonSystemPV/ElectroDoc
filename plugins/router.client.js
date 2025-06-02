export default defineNuxtPlugin(nuxtApp => {
  const router = useRouter();
  
  console.log('Plugin de router inicializado');
  
  // Redireccionar la raíz a la página de proyectos
  router.beforeEach((to, from) => {
    console.log(`Navegando desde ${from.path} hacia ${to.path}`);
    
    if (to.path === '/' || to.path === '') {
      console.log('Redireccionando a /projects');
      return { path: '/projects', replace: true };
    }
    
    return true;
  });
}); 