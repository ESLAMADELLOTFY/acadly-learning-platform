"use client";

import type { AdminDashboardData } from "@acadly/modules/shared/models/learning-platform";
import { Button, Icon } from "@acadly/infrastructure/components/common";

export function ReportExportButton({
  overview,
}: {
  overview: AdminDashboardData;
}) {
  const downloadReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total users", overview.totalUsers],
      ["Total questions", overview.totalQuestions],
      ["Total quizzes", overview.totalQuizzes],
      ["Published quizzes", overview.activeQuizzes],
      ["Average score", `${overview.averageScore}%`],
      ["Completion rate", `${overview.completionRate}%`],
      [],
      ["Day", "Submissions"],
      ...overview.weeklySubmissions.map(({ day, submissions }) => [day, submissions]),
    ];
    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "acadly-learning-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="secondary" className="gap-2" onClick={downloadReport}>
      <Icon name="arrow-down" size={16} />
      Export report
    </Button>
  );
}
