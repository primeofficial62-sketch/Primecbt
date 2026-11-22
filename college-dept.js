// PRIME-CBT: college/department dropdowns + "update your profile" prompt
// Matches the live schema: colleges -> departments, and profiles store TEXT
// (profiles.college, profiles.department), same as before.
const sb = window.supabaseClient; // change to your existing Supabase client variable

/* ---------- 1. Dropdowns (sign-up page AND profile page) ----------
HTML:
  <select id="college"><option value="">Select college</option></select>
  <select id="department" disabled><option value="">Select department</option></select>
Profile page: await initCollegeDept({ college: p.college, department: p.department })
Sign-up page: await initCollegeDept()
*/
async function initCollegeDept(saved = {}) {
  const collegeEl = document.getElementById('college');
  const deptEl = document.getElementById('department');

  const { data: colleges, error } = await sb
    .from('colleges').select('id, name')
    .eq('is_active', true).order('sort_order');
  if (error) { console.error(error); return; }

  collegeEl.innerHTML = '<option value="">Select college</option>' +
    colleges.map(c => `<option value="${c.name}" data-id="${c.id}">${c.name}</option>`).join('');

  async function loadDepts(collegeId, savedDept) {
    if (!collegeId) {
      deptEl.innerHTML = '<option value="">Select department</option>';
      deptEl.disabled = true;
      return;
    }
    const { data: depts } = await sb
      .from('departments').select('id, name')
      .eq('college_id', collegeId).eq('is_active', true).order('name');
    deptEl.innerHTML = '<option value="">Select department</option>' +
      depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    deptEl.disabled = false;
    // Old free-typed values that don't match the list are ignored, so user re-picks
    if (savedDept && depts.some(d => d.name === savedDept)) deptEl.value = savedDept;
  }

  collegeEl.addEventListener('change', () => {
    const opt = collegeEl.selectedOptions[0];
    loadDepts(opt && opt.dataset.id);
  });

  if (saved.college) {
    collegeEl.value = saved.college;
    const opt = collegeEl.selectedOptions[0];
    if (opt && opt.dataset.id) await loadDepts(opt.dataset.id, saved.department);
  }
}

/* ---------- 2. Save (sign-up or profile) ---------- */
async function saveCollegeDept(userId) {
  const college = document.getElementById('college').value;
  const department = document.getElementById('department').value;
  if (!college || !department) {
    alert('Please select your college and department.');
    return false;
  }
  const { error } = await sb.from('profiles')
    .update({ college, department }).eq('id', userId);
  if (error) { alert(error.message); return false; }
  return true;
}

/* ---------- 3. Banner for users who haven't picked yet ---------- */
// Call after login on every page. Hidden for the session if dismissed.
async function promptProfileUpdateIfNeeded() {
  if (sessionStorage.getItem('hideCollegeBanner')) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  const { data: p } = await sb.from('profiles')
    .select('college, department').eq('id', user.id).single();
  if (p && (!p.college || !p.department)) {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;' +
      'background:#f59e0b;color:#000;padding:10px 40px 10px 14px;text-align:center;font:14px sans-serif';
    bar.innerHTML = 'Please update your profile with your college and department. ' +
      '<a href="/profile.html" style="color:#000;font-weight:700">Update now</a>' +
      '<span id="cdClose" style="position:absolute;right:14px;top:8px;cursor:pointer;font-size:18px">&times;</span>';
    document.body.prepend(bar);
    document.getElementById('cdClose').onclick = () => {
      sessionStorage.setItem('hideCollegeBanner', '1'); bar.remove();
    };
  }
}
