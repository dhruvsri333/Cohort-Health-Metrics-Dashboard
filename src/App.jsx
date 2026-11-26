import { useMemo, useState } from 'react';
import students from './data/students.json';

const attendanceOf = (student) => Math.round((student.attendance.attended / student.attendance.total) * 100);
const completionOf = (student) => Math.round((student.assignments.submitted / student.assignments.total) * 100);
const riskReasons = (student) => [
  ...(attendanceOf(student) < 75 ? ['Low attendance'] : []),
  ...(completionOf(student) < 60 ? ['Low submissions'] : []),
];
const isAtRisk = (student) => riskReasons(student).length > 0;

function Avatar({ name, small = false }) {
  return <span className={`avatar${small ? ' avatar-small' : ''}`}>{name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>;
}

function MetricCard({ icon, label, value, note, tone, progress }) {
  return <article className="metric-card">
    <div className="metric-top"><span className={`metric-icon ${tone}`}>{icon}</span><span className="metric-note">{note}</span></div>
    <div className="metric-value">{value}</div><div className="metric-label">{label}</div>
    {progress !== undefined && <div className="metric-progress"><span style={{ width: `${progress}%` }} /></div>}
  </article>;
}

function App() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All students');
  const [period, setPeriod] = useState('This month');
  const [active, setActive] = useState('Overview');
  const atRisk = useMemo(() => students.filter(isAtRisk), []);
  const attendanceAverage = Math.round(students.reduce((sum, student) => sum + attendanceOf(student), 0) / students.length);
  const submissionAverage = Math.round(students.reduce((sum, student) => sum + completionOf(student), 0) / students.length);
  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${student.name} ${student.id} ${student.email}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'All students' || (filter === 'At risk' ? isAtRisk(student) : !isAtRisk(student));
    return matchesSearch && matchesFilter;
  });

  function exportCsv() {
    const rows = [
      ['Student ID', 'Name', 'Email', 'Attendance %', 'Submissions', 'Submission completion %', 'Status', 'Risk reason'],
      ...filteredStudents.map((student) => [student.id, student.name, student.email, attendanceOf(student), `${student.assignments.submitted}/${student.assignments.total}`, completionOf(student), isAtRisk(student) ? 'At Risk' : 'On Track', riskReasons(student).join('; ') || ''])
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cohort-students.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={() => setActive('Overview')}><span className="brand-mark">c</span><span>cohort<span className="brand-light">care</span></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <div className="cohort-picker"><span className="cohort-dot">B</span><span><strong>Bootcamp 2025</strong><small>Full Stack Development</small></span><span className="chevron">⌄</span></div>
      <div className="nav-label">MENU</div>
      <nav className="nav-list">
        {[['▦', 'Overview', 'overview'], ['♙', 'Students', 'students'], ['⌁', 'Analytics', 'analytics']].map(([icon, label, id]) => <a key={id} className={`nav-item ${active === label ? 'selected' : ''}`} href={`#${id}`} onClick={() => setActive(label)}><span className="nav-icon">{icon}</span>{label}{label === 'Students' && <span className="nav-count">12</span>}</a>)}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">✦</span><strong>Need a hand?</strong><p>Learn how to get the most out of your cohort dashboard.</p><a href="#about">View quick guide <span>↗</span></a></div><div className="profile"><div className="profile-avatar">DS</div><div><strong>Dhruv Srivastava</strong><small>Program mentor</small></div><button aria-label="Profile options">···</button></div></div>
    </aside>

    <main className="main-content" id="overview">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="live-status"><i /> Demo data</span><button className="icon-button" aria-label="Notifications">♧<b /></button><Avatar name="Dhruv Srivastava" small /></div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow">WEDNESDAY, NOVEMBER 19, 2026</div><h1>Good morning, Dhruv <span>✦</span></h1><p>Here’s what’s happening with your cohort today.</p></div><button className="button button-primary" onClick={exportCsv}><span>⇩</span> Export report</button></section>

        <section className="metrics-grid" aria-label="Cohort key metrics">
          <MetricCard icon="♙" tone="mint" label="Total students" value={students.length} note="Active cohort" />
          <MetricCard icon="◷" tone="blue" label="Average attendance" value={`${attendanceAverage}%`} note="↑ 4.2% this month" progress={attendanceAverage} />
          <MetricCard icon="✓" tone="violet" label="Submission completion" value={`${submissionAverage}%`} note="↑ 2.8% this month" progress={submissionAverage} />
          <MetricCard icon="⚑" tone="amber" label="Students at risk" value={atRisk.length} note="Need attention" />
        </section>

        <section className="analytics-grid" id="analytics">
          <article className="panel attendance-panel"><div className="panel-heading"><div><h2>Cohort attendance</h2><p>Attendance trend across your cohort</p></div><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Chart period"><option>This month</option><option>Last 3 months</option><option>This year</option></select></div>
            <div className="chart-summary"><strong>{attendanceAverage}%</strong><span className="positive-pill">↗ 4.2%</span><small>vs. previous month</small></div>
            <div className="chart-wrap"><div className="y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div><div className="chart-area"><div className="grid-lines"><i/><i/><i/><i/></div><svg className="attendance-chart" viewBox="0 0 700 180" preserveAspectRatio="none" role="img" aria-label="Attendance increased during the month"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4a9b76" stopOpacity=".2"/><stop offset="100%" stopColor="#4a9b76" stopOpacity="0"/></linearGradient></defs><path d="M0 98 C45 88 55 112 100 90 S155 75 200 92 S255 98 300 68 S355 62 400 76 S455 82 500 52 S555 70 600 40 S655 49 700 25 L700 180 L0 180Z" fill="url(#fill)"/><path d="M0 98 C45 88 55 112 100 90 S155 75 200 92 S255 98 300 68 S355 62 400 76 S455 82 500 52 S555 70 600 40 S655 49 700 25" fill="none" stroke="#438f6c" strokeWidth="3" strokeLinecap="round"/></svg><div className="x-labels"><span>Nov 1</span><span>Nov 5</span><span>Nov 10</span><span>Nov 15</span><span>Nov 19</span></div></div></div>
          </article>
          <article className="panel submission-panel"><div className="panel-heading"><div><h2>Assignment progress</h2><p>Submission status for this cohort</p></div><button className="more-button" aria-label="More options">···</button></div><div className="donut-wrap"><div className="donut" style={{ '--progress': `${submissionAverage}%` }}><div><strong>{submissionAverage}%</strong><small>completed</small></div></div></div><div className="legend"><div><i className="legend-green"/><span>Submitted</span><strong>{students.reduce((sum, s) => sum + s.assignments.submitted, 0)}</strong></div><div><i className="legend-gray"/><span>Remaining</span><strong>{students.reduce((sum, s) => sum + s.assignments.total - s.assignments.submitted, 0)}</strong></div></div></article>
        </section>

        <section className="panel students-panel" id="students"><div className="students-heading"><div><div className="title-with-count"><h2>Student overview</h2><span>{filteredStudents.length}</span></div><p>Track attendance and assignment progress for each student.</p></div><button className="button button-outline" onClick={exportCsv}><span>⇩</span> Export CSV</button></div>
          <div className="table-toolbar"><label className="search-box"><span>⌕</span><input type="search" placeholder="Search students..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="filter-wrap"><span>Show:</span><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter students"><option>All students</option><option>On track</option><option>At risk</option></select></div></div>
          <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>ATTENDANCE</th><th>ASSIGNMENTS</th><th>LAST ACTIVE</th><th>STATUS</th><th></th></tr></thead><tbody>{filteredStudents.map((student) => { const attendance = attendanceOf(student); const completion = completionOf(student); const risk = isAtRisk(student); return <tr key={student.id}><td><div className="student-cell"><Avatar name={student.name} /><div><strong>{student.name}</strong><small>{student.id}</small></div></div></td><td><div className="progress-cell"><strong className={attendance < 75 ? 'text-risk' : ''}>{attendance}%</strong><div className="mini-progress"><i className={attendance < 75 ? 'risk-fill' : ''} style={{ width: `${attendance}%` }}/></div></div></td><td><div className="assignment-cell"><strong className={completion < 60 ? 'text-risk' : ''}>{student.assignments.submitted}/{student.assignments.total}</strong><small>{completion}% complete</small></div></td><td className="last-active">{student.lastActive}</td><td><span className={`status ${risk ? 'status-risk' : 'status-good'}`}><i/>{risk ? 'At risk' : 'On track'}</span></td><td><button className="row-more" aria-label={`More options for ${student.name}`}>···</button></td></tr>; })}</tbody></table>{filteredStudents.length === 0 && <div className="empty-state">No students match this search.</div>}</div>
          <div className="table-footer"><span>Showing <strong>{filteredStudents.length ? 1 : 0}–{filteredStudents.length}</strong> of <strong>{filteredStudents.length}</strong> students</span><span className="sample-note">Sample data for demonstration</span></div>
        </section>
        <footer className="page-footer" id="about">CohortCare <span>·</span> Helping every learner thrive</footer>
      </div>
    </main>
  </div>;
}

export default App;
