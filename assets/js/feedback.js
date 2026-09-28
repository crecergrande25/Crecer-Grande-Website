document.addEventListener('DOMContentLoaded',()=> {
  const form=document.getElementById('feedback-form');
  if(!form)return;

  const steps=[...form.querySelectorAll('.fb-step')];
  const bar=document.getElementById('fb-progress-bar');
  const label=document.getElementById('fb-step-label');
  const status=document.getElementById('feedback-status');
  const thanks=document.getElementById('fb-thanks');
  const contactFields=document.getElementById('fb-contact-fields');
  let current=0;
  let advancing=false;

  const show=(i)=>{
    current=Math.max(0,Math.min(steps.length-1,i));
    steps.forEach((s,n)=>s.classList.toggle('active',n===current));
    bar.style.width=((current+1)/steps.length*100)+'%';
    label.textContent=(current+1)+' of '+steps.length;
    status.textContent='';
    requestAnimationFrame(()=>{
      window.scrollTo({top:Math.max(0,form.offsetTop-105),behavior:'smooth'});
    });
  };

  const advanceSoon=(delay=260)=>{
    if(advancing)return;
    advancing=true;
    setTimeout(()=>{
      advancing=false;
      show(current+1);
    },delay);
  };

  // Single-choice questions move forward automatically.
  form.querySelectorAll('[name="overall_rating"]').forEach(input=>{
    input.addEventListener('change',()=>{
      if(input.checked) advanceSoon(240);
    });
  });

  form.querySelectorAll('[name="recommend_score"]').forEach(input=>{
    input.addEventListener('change',()=>{
      if(input.checked) advanceSoon(240);
    });
  });

  form.addEventListener('click',(e)=>{
    const next=e.target.closest('[data-next]');
    const back=e.target.closest('[data-back]');
    if(next){
      if(current===0 && !form.querySelector('[name="overall_rating"]:checked')){
        status.className='fb-status error';
        status.textContent='Please choose the face that best matches your experience.';
        return;
      }
      show(current+1);
    }
    if(back) show(current-1);
  });

  form.querySelectorAll('[name="follow_up_choice"]').forEach(el=>{
    el.addEventListener('change',()=>{
      contactFields.hidden=form.querySelector('[name="follow_up_choice"]:checked')?.value!=='yes';
    });
  });

  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const submit=form.querySelector('button[type="submit"]');
    const old=submit.textContent;
    submit.disabled=true;
    submit.textContent='Sending…';
    status.className='fb-status';
    status.textContent='';

    const fd=new FormData(form);
    const rating=Number(fd.get('overall_rating'));
    if(!rating){
      show(0);
      status.className='fb-status error';
      status.textContent='Please choose an overall experience rating.';
      submit.disabled=false;
      submit.textContent=old;
      return;
    }

    const cfg=window.CG_CONFIG||{};
    let client=window.CG_SUPABASE;
    if(!client&&window.supabase&&cfg.supabaseUrl&&cfg.supabasePublishableKey){
      client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey);
      window.CG_SUPABASE=client;
    }
    if(!client){
      status.className='fb-status error';
      status.textContent='Feedback service is temporarily unavailable. Please try again shortly.';
      submit.disabled=false;
      submit.textContent=old;
      return;
    }

    const ids=window.CGVisitorIds?window.CGVisitorIds():['',''];
    const follow=fd.get('follow_up_choice')==='yes';
    const score=fd.get('recommend_score');
    const payload={
      overall_rating:rating,
      experience_words:fd.getAll('experience_words'),
      liked_most:String(fd.get('liked_most')||'').trim()||null,
      went_wrong:String(fd.get('went_wrong')||'').trim()||null,
      improvement:String(fd.get('improvement')||'').trim()||null,
      recommend_score:score===''||score===null?null:Number(score),
      follow_up_ok:follow,
      name:follow?(String(fd.get('name')||'').trim()||null):null,
      email:follow?(String(fd.get('email')||'').trim()||null):null,
      source_page:document.referrer||'/feedback.html',
      visitor_id:ids[0]||null,
      session_id:ids[1]||null
    };

    const {error}=await client.from('website_feedback').insert(payload);
    if(error){
      status.className='fb-status error';
      status.textContent='We could not save your feedback right now. Please try once more.';
      submit.disabled=false;
      submit.textContent=old;
      return;
    }

    window.CGTrack?.('feedback_submit',{
      overall_rating:rating,
      recommend_score:payload.recommend_score
    });

    form.hidden=true;
    document.querySelector('.fb-progress-shell').hidden=true;
    thanks.hidden=false;
    window.scrollTo({top:Math.max(0,thanks.offsetTop-130),behavior:'smooth'});
  });
});