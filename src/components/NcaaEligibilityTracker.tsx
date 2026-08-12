import React, { useState } from "react";
import { NcaaCourse } from "../types";
import { INITIAL_NCAA_COURSES } from "../data/mockData";
import { GraduationCap, CheckCircle2, AlertTriangle, BookOpen, Plus, Trash2, Award, Info } from "lucide-react";

export const NcaaEligibilityTracker: React.FC = () => {
  const [courses, setCourses] = useState<NcaaCourse[]>(INITIAL_NCAA_COURSES);
  const [satScore, setSatScore] = useState<number>(1280);
  const [actScore, setActScore] = useState<number>(28);

  const [newCourseName, setNewCourseName] = useState("");
  const [newCategory, setNewCategory] = useState<NcaaCourse["category"]>("English");
  const [newGrade, setNewGrade] = useState<NcaaCourse["grade"]>("A");

  // Calculate Core GPA
  const calculateCoreGpa = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((c) => {
      if (c.grade === "In Progress") return;
      let pts = 0;
      if (c.grade === "A") pts = 4.0;
      if (c.grade === "B") pts = 3.0;
      if (c.grade === "C") pts = 2.0;
      if (c.grade === "D") pts = 1.0;
      if (c.grade === "F") pts = 0.0;

      totalPoints += pts * c.credits;
      totalCredits += c.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const coreGpa = Number(calculateCoreGpa());

  const completedCount = courses.filter((c) => c.grade !== "In Progress" && c.grade !== "F").length;
  const progressPercent = Math.min(100, Math.round((completedCount / 16) * 100));

  // Category counts
  const categoryRequirements = [
    { name: "English", required: 4, count: courses.filter((c) => c.category === "English" && c.grade !== "F").length },
    { name: "Math", required: 3, count: courses.filter((c) => c.category === "Math" && c.grade !== "F").length },
    { name: "Natural Science", required: 2, count: courses.filter((c) => c.category === "Natural Science" && c.grade !== "F").length },
    { name: "Social Science", required: 2, count: courses.filter((c) => c.category === "Social Science" && c.grade !== "F").length },
    { name: "Extra English/Math/Sci", required: 1, count: courses.filter((c) => c.category === "Extra English/Math/Sci" && c.grade !== "F").length },
    { name: "Additional Core", required: 4, count: courses.filter((c) => c.category === "Additional Core" && c.grade !== "F").length },
  ];

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newEntry: NcaaCourse = {
      id: Date.now().toString(),
      category: newCategory,
      courseName: newCourseName.trim(),
      grade: newGrade,
      credits: 1.0,
      isRequired: true,
    };

    setCourses((prev) => [...prev, newEntry]);
    setNewCourseName("");
  };

  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // NCAA Sliding Scale Validator
  const isDiQualifier = coreGpa >= 2.30 && (satScore >= 980 || actScore >= 20) && completedCount >= 10;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> NCAA Eligibility Center Core GPA Calculator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            NCAA Core Course & GPA Eligibility Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track completion of all 16 required core courses and verify Division I & II qualifier status.
          </p>
        </div>

        {/* Qualifier Badge */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          isDiQualifier
            ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
            : "bg-amber-950/80 border-amber-500/40 text-amber-300"
        }`}>
          {isDiQualifier ? <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />}
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-wider opacity-80">NCAA Qualifier Status</p>
            <p className="text-sm font-black text-white">
              {isDiQualifier ? "NCAA Division I Academic Qualifier" : "In Progress / Pending Core Courses"}
            </p>
          </div>
        </div>
      </div>

      {/* CORE PROGRESS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calculated Core GPA</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-400">{coreGpa.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-semibold">/ 4.00 Scale</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            NCAA Division I Minimum: <strong className="text-white">2.30 Core GPA</strong>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Core Course Completion</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">{completedCount}</span>
            <span className="text-xs text-slate-500 font-semibold">/ 16 Core Courses</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-400" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">SAT / ACT Sliding Scale</p>
          <div className="flex gap-3 mt-2">
            <div className="flex-1 bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">SAT Score</span>
              <input
                type="number"
                min={400}
                max={1600}
                value={satScore}
                onChange={(e) => setSatScore(Number(e.target.value))}
                className="w-full text-center font-bold text-white bg-transparent focus:outline-none"
              />
            </div>
            <div className="flex-1 bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-semibold">ACT Score</span>
              <input
                type="number"
                min={1}
                max={36}
                value={actScore}
                onChange={(e) => setActScore(Number(e.target.value))}
                className="w-full text-center font-bold text-white bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 16 CORE COURSE CATEGORY BREAKDOWN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-md font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" /> 16 NCAA Core Course Requirement Progress
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categoryRequirements.map((cat, idx) => {
            const isMet = cat.count >= cat.required;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isMet
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider truncate">{cat.name}</p>
                <p className="text-lg font-black mt-1 text-white">
                  {cat.count} <span className="text-xs text-slate-500 font-semibold">/ {cat.required}</span>
                </p>
                <p className="text-[9px] font-semibold mt-1">
                  {isMet ? "✓ Requirement Met" : "In Progress"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CORE COURSES LIST & ADD FORM */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-md font-bold text-white">Core Course List ({courses.length} Logged)</h2>
            <p className="text-xs text-slate-400">Classes evaluated by NCAA Eligibility Center for GPA computation.</p>
          </div>

          {/* Add Course Inline Form */}
          <form onSubmit={handleAddCourse} className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              required
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="Course Name (e.g. Physics Honors)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as NcaaCourse["category"])}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Math">Math</option>
              <option value="Natural Science">Natural Science</option>
              <option value="Social Science">Social Science</option>
              <option value="Extra English/Math/Sci">Extra Eng/Math/Sci</option>
              <option value="Additional Core">Additional Core</option>
            </select>
            <select
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value as NcaaCourse["grade"])}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
            >
              <option value="A">Grade: A</option>
              <option value="B">Grade: B</option>
              <option value="C">Grade: C</option>
              <option value="D">Grade: D</option>
              <option value="In Progress">In Progress</option>
            </select>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 min-h-[44px] rounded-xl text-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </form>
        </div>

        {/* Course List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Course Name</th>
                <th className="p-3">Core Category</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Credits</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-950/60">
                  <td className="p-3 font-bold text-white">{course.courseName}</td>
                  <td className="p-3 font-medium text-slate-400">{course.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      course.grade === "A"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : course.grade === "B"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {course.grade}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{course.credits.toFixed(1)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
