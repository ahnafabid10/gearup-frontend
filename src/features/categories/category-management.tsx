"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api, getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import type { GearRecord } from "@/lib/types";

export function CategorySuggestions({ admin = false, onApproved }: { admin?: boolean; onApproved?: () => void }) {
  const suggestions = useApiData("categories/suggestions");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true); setError(""); setMessage("");
    try {
      await api("categories/suggestions", "POST", { name: String(fields.get("name")).trim(), description: String(fields.get("description")).trim() });
      form.reset();
      setMessage("Suggestion sent. An admin will review it before it appears in the category dropdown.");
      await suggestions.reload();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  async function review(id: string, status: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      await api(`categories/suggestions/${id}`, "PATCH", { status, reviewNote: notes[id] || "" });
      setMessage(status === "APPROVED" ? "Suggestion approved. The category is now available to providers." : "Suggestion rejected.");
      await suggestions.reload(); onApproved?.();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="category-suggestions" aria-labelledby="suggestions-heading">
    <div className="section-heading"><div><h2 id="suggestions-heading">{admin ? "Category suggestions" : "Can’t find the right category?"}</h2><p>{admin ? "Review requests from providers before adding them to the collection." : "Suggest a category and track the admin’s response here."}</p></div><button type="button" onClick={suggestions.reload} disabled={suggestions.loading}>Refresh</button></div>
    {!admin && <form onSubmit={submit} className="panel category-form">
      <label>Suggested category<input name="name" required minLength={2} maxLength={80} placeholder="For example, Climbing" /></label>
      <label>Why is it needed?<textarea name="description" maxLength={1000} placeholder="Tell us what kind of equipment belongs here" /></label>
      <button className="btn" disabled={busy}>{busy ? "Sending…" : "Suggest a category"}</button>
    </form>}
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="notice" role="status">{message}</p>}
    <DataState loading={suggestions.loading} error={suggestions.error} empty={false} retry={suggestions.reload}>
      {!getRows(suggestions.data).length ? <p className="category-empty">{admin ? "No category suggestions to review yet" : "You haven’t suggested any categories yet"}</p> : <div className="suggestion-list">{getRows(suggestions.data).map(item => <article className="panel suggestion-item" key={item.id}>
        <div className="suggestion-title"><h3>{item.name}</h3><span className={`badge ${item.status?.toLowerCase()}`}>{item.status === "PENDING" ? "Awaiting review" : item.status === "APPROVED" ? "Approved" : "Rejected"}</span></div>
        {admin && <p>Suggested by {item.provider?.name}</p>}
        {item.description && <p>{item.description}</p>}
        {item.reviewNote && <p><strong>Admin response:</strong> {item.reviewNote}</p>}
        {item.status === "APPROVED" && item.category && <p>Category: {item.category.name}{item.category.isActive === false ? " (currently inactive)" : ""}</p>}
        {admin && item.status === "PENDING" && <div className="category-review"><label>Response (optional)<input maxLength={500} value={notes[item.id] || ""} onChange={event => setNotes({...notes, [item.id]: event.target.value})} /></label><div className="category-actions"><button className="btn small" disabled={busy} onClick={() => review(item.id, "APPROVED")}>Approve</button><button disabled={busy} onClick={() => review(item.id, "REJECTED")}>Reject</button></div></div>}
      </article>)}</div>}
    </DataState>
  </section>;
}

export function CategoryManagement({ role }: { role: string }) {
  const admin = role === "admin";
  const categories = useApiData(admin ? "categories/manage" : "categories");
  const [editing, setEditing] = useState<GearRecord>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function reset() { setEditing(undefined); setName(""); setDescription(""); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await api(editing ? `categories/${editing.id}` : "categories", editing ? "PATCH" : "POST", {name: name.trim(), description: description.trim()});
      setMessage(editing ? "Category updated" : "Category created and ready to select");
      reset(); await categories.reload();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  async function update(item: GearRecord, remove = false) {
    if (remove && !confirm(`Delete the unused category “${item.name}”?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api(`categories/${item.id}`, remove ? "DELETE" : "PATCH", remove ? undefined : {isActive: !item.isActive});
      if (editing?.id === item.id) reset();
      setMessage(remove ? "Unused category deleted" : item.isActive ? "Category deactivated. Existing listings are preserved." : "Category activated");
      await categories.reload();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  return <main className="shell section">
    <Link href={`/dashboard/${role}`}>← Dashboard</Link>
    <div className="section-heading"><div><h1 className="page-title">Categories</h1><p>{admin ? "Keep equipment organised. Manage categories and review provider suggestions." : "Choose an existing category or suggest one for admin review."}</p></div>{!admin && <Link className="btn" href="/dashboard/provider/gear/new">List new gear ↗</Link>}</div>
    {admin && <div className="category-manager">
      <form className="panel category-form" onSubmit={save}>
        <h2>{editing ? "Edit category" : "Add a category"}</h2>
        <label>Name<input required minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="For example, Camping" /></label>
        <label>Description<textarea maxLength={1000} value={description} onChange={event => setDescription(event.target.value)} placeholder="What equipment belongs in this category?" /></label>
        <div className="category-actions"><button className="btn" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create category"}</button>{editing && <button type="button" disabled={busy} onClick={reset}>Cancel</button>}</div>
        <p>New categories are active immediately. Renaming keeps existing links working.</p>
      </form>
      <div>
        {error && <p role="alert" className="error">{error}</p>}{message && <p role="status" className="notice">{message}</p>}
        <DataState loading={categories.loading} error={categories.error} empty={false} retry={categories.reload}>
          {!getRows(categories.data).length ? <div className="empty"><h3>Your first category starts here</h3><p>Create a category so providers can list their gear.</p></div> : <div className="table-wrap"><table><thead><tr><th>Category</th><th>Gear</th><th>Status</th><th>Actions</th></tr></thead><tbody>{getRows(categories.data).map(item => <tr key={item.id}>
            <td>{item.name}<small>{item.description}</small></td><td>{item._count?.gearItems ?? 0}</td><td><span className={`badge ${item.isActive ? "active" : "unavailable"}`}>{item.isActive ? "Active" : "Inactive"}</span></td><td><div className="category-actions"><button disabled={busy} onClick={() => {setEditing(item); setName(item.name || ""); setDescription(item.description || ""); setError(""); setMessage("");}}>Edit</button><button disabled={busy} onClick={() => update(item)}>{item.isActive ? "Deactivate" : "Activate"}</button><button disabled={busy || (item._count?.gearItems ?? 0) > 0} title={(item._count?.gearItems ?? 0) > 0 ? "Used by gear — deactivate instead" : "Delete unused category"} onClick={() => update(item, true)}>Delete</button></div></td>
          </tr>)}</tbody></table></div>}
        </DataState>
        <p className="category-help">Categories with gear cannot be deleted. Deactivate them to prevent new listings, or have providers move their gear to an active category first.</p>
      </div>
    </div>}
    {!admin && <DataState loading={categories.loading} error={categories.error} empty={false} retry={categories.reload}><div className="category-chips">{getRows(categories.data).map(item => <Link key={item.id} href={`/gear?categoryId=${encodeURIComponent(item.id)}`}>{item.name} ↗</Link>)}</div></DataState>}
    <CategorySuggestions admin={admin} onApproved={categories.reload} />
  </main>;
}
