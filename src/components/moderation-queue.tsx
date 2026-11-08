"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ReportItem = {
  id: string; reason: string; createdAt: string;
  reporter: { name: string; username: string | null };
  post: { id: string; content: string; author: { name: string; username: string | null } };
};

export function ModerationQueue({ reports }: { reports: ReportItem[] }) {
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const router = useRouter();

  async function resolve(reportId: string, status: "RESOLVED" | "DISMISSED", removePost: boolean) {
    setBusyId(reportId);
    setMessage("");
    try {
      const response = await fetch(`/api/moderation/reports/${reportId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, removePost }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Report could not be updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report could not be updated.");
    } finally {
      setBusyId("");
    }
  }

  return <>{message && <p className="maviri-form-error" role="alert">{message}</p>}{reports.length ? <div className="maviri-report-list">{reports.map((report) => <article className="maviri-report-card" key={report.id}><div><span>REPORTED BY {report.reporter.username ? `@${report.reporter.username}` : report.reporter.name} / {report.createdAt.slice(0, 10)}</span><p className="maviri-report-card__reason">{report.reason}</p><p className="maviri-report-card__post">“{report.post.content}”</p><span>POST BY {report.post.author.username ? `@${report.post.author.username}` : report.post.author.name}</span><Link href={`/community/${report.post.id}`}>OPEN DISCUSSION ↗</Link></div><div className="maviri-report-card__actions"><button type="button" disabled={busyId === report.id} onClick={() => resolve(report.id, "DISMISSED", false)}>DISMISS</button><button type="button" disabled={busyId === report.id} onClick={() => resolve(report.id, "RESOLVED", false)}>RESOLVE</button><button type="button" disabled={busyId === report.id} onClick={() => resolve(report.id, "RESOLVED", true)}>REMOVE POST</button></div></article>)}</div> : <div className="maviri-empty-state"><span>MODERATION / OPEN REPORTS 00</span><h2>No open reports.</h2><p>New reports from the community will appear here.</p></div>}</>;
}
