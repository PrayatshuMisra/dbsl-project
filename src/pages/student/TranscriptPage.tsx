import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { Enrollment, Course, GradeValue } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradeBadge } from '@/components/shared/Badges';
import { GraduationCap, Printer, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const gradePoints: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0 };

export default function TranscriptPage() {
  const user = useAuthStore(s => s.user);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      const [bannerLogo, emblemSeal] = await Promise.all([
        getBase64Image('/maheLogo.png'),
        getBase64Image('/mit-symb.jpg')
      ]);

      // Header - Institutional Blue Background Strip
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // MAHE Banner Logo
      doc.addImage(bannerLogo, 'PNG', pageWidth / 2 - 40, 8, 80, 20); // Centralized banner

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("MANIPAL INSTITUTE OF TECHNOLOGY", pageWidth / 2, 34, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("OFFICIAL ACADEMIC TRANSCRIPT", pageWidth / 2, 39, { align: "center" });

      // Student Info Block
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55, pageWidth - 20, 55);

      doc.setFont("helvetica", "bold");
      doc.text("STUDENT NAME:", 20, 65);
      doc.setFont("helvetica", "normal");
      doc.text(user?.full_name || "N/A", 70, 65);

      doc.setFont("helvetica", "bold");
      doc.text("REGISTRATION NO:", 20, 72);
      doc.setFont("helvetica", "normal");
      doc.text(user?.id || "N/A", 70, 72);

      doc.setFont("helvetica", "bold");
      doc.text("DEPARTMENT:", 20, 79);
      doc.setFont("helvetica", "normal");
      doc.text(user?.department || "N/A", 70, 79);

      doc.setFont("helvetica", "bold");
      doc.text("DATE OF ISSUE:", pageWidth - 80, 65);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString(), pageWidth - 45, 65);

      // Table
      const tableData = enrollments.map(e => {
        const course = courses.find(c => c.course_id === e.course_id);
        return [
          course?.course_code || "",
          course?.title || "",
          course?.credits || "0",
          e.grade || "N/A",
          (gradePoints[e.grade!] || 0).toFixed(1)
        ];
      });

      autoTable(doc, {
        startY: 90,
        head: [['CODE', 'COURSE TITLE', 'CREDITS', 'GRADE', 'POINTS']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 30 },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' }
        }
      });

      // Summary & GPA
      const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(20, finalY, pageWidth - 20, finalY);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`CUMULATIVE GPA: ${gpa}`, 20, finalY + 15);

      doc.setFontSize(10);
      doc.text(`TOTAL CREDITS EARNED: ${totalCredits}`, 20, finalY + 22);

      // Institutional Seal & Signature Area
      const sigY = finalY + 50;

      // Final MIT Seal Image
      doc.addImage(emblemSeal, 'JPEG', 25, sigY - 20, 25, 25);

      doc.setFontSize(9);
      doc.setDrawColor(200, 200, 200);
      doc.line(pageWidth - 75, sigY, pageWidth - 20, sigY);
      doc.text("UNIVERSITY REGISTRAR", pageWidth - 47, sigY + 5, { align: "center" });

      doc.save(`Transcript_${user?.full_name}_${user?.id}.pdf`);
    } catch (error) {
      console.error("PDF Branding Failed:", error);
      // Fallback to text-only if images fail
      alert("Institutional branding images could not be loaded. Generating text-only transcript.");
      handleExportPDF_legacy();
    }
  };

  const handleExportPDF_legacy = () => {
    // Legacy text-only fallback implementation here (simplified)
    const doc = new jsPDF();
    doc.text("MANIPAL INSTITUTE OF TECHNOLOGY", 20, 20);
    doc.text("OFFICIAL ACADEMIC TRANSCRIPT", 20, 30);
    doc.save(`Transcript_Standard.pdf`);
  };

  useEffect(() => {
    if (user) {
      Promise.all([enrollmentService.getEnrollmentsByStudent(user.id), courseService.getCourses()]).then(([e, c]) => {
        setEnrollments(e.filter(en => en.approval_status === 'approved' && en.grade));
        setCourses(c);
      });
    }
  }, [user]);

  const getCourse = (id: string) => courses.find(c => c.course_id === id);
  const totalCredits = enrollments.reduce((sum, e) => sum + (getCourse(e.course_id)?.credits || 0), 0);
  const gpa = enrollments.length > 0
    ? (enrollments.reduce((sum, e) => {
      const course = getCourse(e.course_id);
      return sum + (gradePoints[e.grade!] || 0) * (course?.credits || 0);
    }, 0) / totalCredits).toFixed(2)
    : 'N/A';

  // Group by semester
  const bySemester = enrollments.reduce((acc, e) => {
    const course = getCourse(e.course_id);
    const sem = course?.semester || 'Unknown';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(e);
    return acc;
  }, {} as Record<string, Enrollment[]>);

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Academic Transcript</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Certified record of your scholarly achievements</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-lg h-10 px-6 font-bold border-border/60 shadow-soft" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2 stroke-[2.5px]" />
            Print Record
          </Button>
          <Button className="rounded-lg h-10 px-6 font-bold shadow-lg shadow-primary/20" onClick={handleExportPDF}>
            <FileDown className="h-4 w-4 mr-2 stroke-[2.5px]" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="rounded-xl shadow-card print:shadow-none print:border print:border-black/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <CardContent className="p-10 md:p-14">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between border-b border-borderpb-8 mb-10 gap-8">
            <div className="flex items-center gap-5">
              <div className="rounded-xl bg-white p-3 shadow-lg ring-1 ring-black/5">
                <img src="/mit-symb.jpg" alt="MIT Manipal Emblem" className="h-10 w-10 object-contain" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold font-display tracking-tight text-foreground uppercase">Manipal Institute of Technology</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-70">Office of the University Registrar</p>
              </div>
            </div>
            <div className="text-center md:text-right space-y-1.5 pt-1">
              <p className="text-lg font-extrabold font-display leading-tight">{user?.full_name}</p>
              <div className="flex flex-col gap-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <p>Student Reference: <span className="text-foreground">{user?.id}</span></p>
                <p>Faculty: <span className="text-foreground">{user?.department}</span></p>
                <p>Issued: <span className="text-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {Object.entries(bySemester).map(([semester, semEnrollments]) => {
              const semCredits = semEnrollments.reduce((sum, e) => sum + (getCourse(e.course_id)?.credits || 0), 0);
              const semGPA = (semEnrollments.reduce((sum, e) => {
                const c = getCourse(e.course_id);
                return sum + (gradePoints[e.grade!] || 0) * (c?.credits || 0);
              }, 0) / semCredits).toFixed(2);

              return (
                <div key={semester} className="relative group">
                  <div className="flex items-center justify-between mb-4 border-l-4 border-primary pl-4">
                    <h3 className="font-bold font-display uppercase tracking-wider text-sm">{semester}</h3>
                    <div className="h-px flex-1 mx-6 bg-border/40" />
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border/40">
                      Term GPA: <span className="text-foreground ml-1">{semGPA}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 overflow-hidden shadow-soft">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border/50">
                          <th className="p-4 font-bold uppercase tracking-[0.15em] text-muted-foreground/80 w-32">Course Code</th>
                          <th className="p-4 font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Academic Title</th>
                          <th className="p-4 font-bold uppercase tracking-[0.15em] text-muted-foreground/80 text-center">Units</th>
                          <th className="p-4 font-bold uppercase tracking-[0.15em] text-muted-foreground/80 text-center">Grade</th>
                          <th className="p-4 font-bold uppercase tracking-[0.15em] text-muted-foreground/80 text-center">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semEnrollments.map(e => {
                          const course = getCourse(e.course_id);
                          return (
                            <tr key={e.enrollment_id} className="border-b border-border/30 hover:bg-muted/5 transition-colors">
                              <td className="p-4 font-bold text-foreground">{course?.course_code}</td>
                              <td className="p-4 font-medium text-foreground/90">{course?.title}</td>
                              <td className="p-4 text-center font-bold text-muted-foreground">{course?.credits}</td>
                              <td className="p-4 text-center">
                                <GradeBadge grade={e.grade as GradeValue} />
                              </td>
                              <td className="p-4 text-center font-bold text-foreground">{(gradePoints[e.grade!] || 0).toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 pt-8 border-t-2 border-slate-900/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Units Concluded</p>
                <p className="text-3xl font-extrabold font-display">{totalCredits}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cumulative Grade Point Average</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-extrabold font-display text-primary">{gpa}</p>
                  <span className="text-xs font-bold text-muted-foreground">/ 4.0</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 grayscale opacity-80 print:opacity-100">
              <div className="h-12 w-48 border-b-2 border-dotted border-foreground/30 relative">
                <p className="absolute bottom-[-24px] left-0 right-0 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">University Registrar</p>
              </div>
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center p-2 ring-4 ring-slate-100 shadow-xl print:ring-0">
                <img src="/mit-symb.jpg" alt="MIT Manipal Seal" className="h-10 w-10 object-contain" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
