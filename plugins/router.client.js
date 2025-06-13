export default defineNuxtPlugin(nuxtApp => {
  const router = nuxtApp.$router || (typeof useRouter === 'function' ? useRouter() : null);
  
  console.log('Plugin de router inicializado');
  
  if (router && typeof router.beforeEach === 'function') {
    // Redireccionar la raíz a la página de proyectos
    router.beforeEach((to, from) => {
      console.log(`Navegando desde ${from.path} hacia ${to.path}`);
      
      if (to.path === '/' || to.path === '') {
        console.log('Redireccionando a /projects');
        return { path: '/projects', replace: true };
      }
      
      return true;
    });
  } else {
    console.error('Router no está disponible en el plugin.');
  }
}); 