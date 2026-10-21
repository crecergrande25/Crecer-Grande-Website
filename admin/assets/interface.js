// Interface behavior only. Session and permission checks remain in admin.js.
(() => {
 let activeDialog=null,lastFocus=null,navigationOpen=false;
 const get=id=>document.getElementById(id),mobile=matchMedia('(max-width:1000px)');
 const focusable=root=>[...root.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(e=>e.getClientRects().length&&!e.closest('[inert]'));
 function syncSidebar(){const aside=get('admin-sidebar');if(aside)aside.inert=mobile.matches&&!navigationOpen;}
 function closeNavigation(restore=true){navigationOpen=false;document.body.classList.remove('navigation-open');get('admin-menu-toggle')?.setAttribute('aria-expanded','false');const w=get('admin-workspace');if(w)w.inert=false;const scrim=get('admin-scrim');if(scrim&&!activeDialog)scrim.hidden=true;syncSidebar();if(restore&&mobile.matches&&!get('admin-app')?.hidden)get('admin-menu-toggle')?.focus();}
 function openNavigation(){if(get('admin-app')?.hidden||!mobile.matches)return;navigationOpen=true;document.body.classList.add('navigation-open');get('admin-menu-toggle')?.setAttribute('aria-expanded','true');get('admin-workspace').inert=true;const scrim=get('admin-scrim');scrim.dataset.mode='menu';scrim.hidden=false;syncSidebar();get('sidebar-close').focus();}
 function openDialog(id){closeNavigation(false);const dialog=get(id);if(!dialog)return;lastFocus=document.activeElement;activeDialog=dialog;dialog.hidden=false;dialog.inert=false;dialog.classList.add('open');const app=get('admin-app');if(app)app.inert=true;if(id==='drawer'){const scrim=get('admin-scrim');scrim.dataset.mode='dialog';scrim.hidden=false}queueMicrotask(()=>{if(activeDialog===dialog)(focusable(dialog)[0]||dialog).focus()});}
 function closeDialog(id){const dialog=get(id);if(!dialog)return;dialog.classList.remove('open');dialog.hidden=true;dialog.inert=true;if(activeDialog===dialog)activeDialog=null;get('admin-scrim')?.setAttribute('hidden','');const app=get('admin-app');if(app)app.inert=app.hidden;if(!app?.hidden&&lastFocus?.isConnected&&!lastFocus.closest('[inert]'))lastFocus.focus();lastFocus=null;}
 function dismiss(){if(activeDialog){if(window.CGAdminCloseDialog)window.CGAdminCloseDialog(activeDialog.id);else closeDialog(activeDialog.id)}else closeNavigation();}
 window.CGAdminUI={openDialog,closeDialog,openNavigation,closeNavigation,isNavigationOpen:()=>navigationOpen};
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-password-target]').forEach(button=>button.addEventListener('click',()=>{const input=get(button.dataset.passwordTarget);if(!input)return;const show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Hide':'Show';button.setAttribute('aria-pressed',String(show));}));
  get('admin-menu-toggle')?.addEventListener('click',()=>navigationOpen?closeNavigation():openNavigation());get('sidebar-close')?.addEventListener('click',()=>closeNavigation());get('admin-scrim')?.addEventListener('click',dismiss);get('user-modal')?.addEventListener('click',e=>{if(e.target===get('user-modal'))dismiss()});syncSidebar();
  mobile.addEventListener('change',()=>closeNavigation(false));
 });
 document.addEventListener('keydown',e=>{
  const root=activeDialog||(navigationOpen?get('admin-sidebar'):null);
  if(e.key==='Escape'&&root){e.preventDefault();dismiss();return}
  if(e.key==='Tab'&&root){const list=focusable(root);if(!list.length){e.preventDefault();root.focus();return}const first=list[0],last=list.at(-1);if(e.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){e.preventDefault();first.focus()}}
 });
})();
