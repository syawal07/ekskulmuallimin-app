import { notFound } from "next/navigation"
import GuruFormClient from "@/components/admin/guru-form-client"
import { getToken } from "@/lib/session"

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
}

interface Mentor {
  id: string;
  name: string;
  username: string;
  mentoring_exculs: Excul[];
}

async function getMentorAndExculs(id: string): Promise<{ mentor: Mentor | null, exculs: Excul[] }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    if (!apiUrl || !token) return { mentor: null, exculs: [] };

    const [mentorRes, exculRes] = await Promise.all([
      fetch(`${apiUrl}/admin/mentors/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        cache: 'no-store'
      }),
      fetch(`${apiUrl}/admin/exculs`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        cache: 'no-store'
      })
    ]);

    const mentorData = mentorRes.ok ? (await mentorRes.json()).data : null;
    const exculData = exculRes.ok ? (await exculRes.json()).data : [];

    return { mentor: mentorData, exculs: exculData };
  } catch (e) {
    return { mentor: null, exculs: [] };
  }
}

export default async function EditGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { mentor, exculs } = await getMentorAndExculs(id)

  if (!mentor) return notFound()

  return <GuruFormClient exculs={exculs} mentor={mentor} />
}