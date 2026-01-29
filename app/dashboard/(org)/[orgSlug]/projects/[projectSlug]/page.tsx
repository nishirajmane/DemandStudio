
export default async function ProjectDashboardPage(props: {
    params: Promise<{ orgSlug: string; projectSlug: string }>
}) {
    const params = await props.params;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Project Overview</h2>
            <p className="text-muted-foreground">
                Welcome to your project dashboard. Manage your content and settings here.
            </p>
            {/* Add more project-specific overview stats/widgets here later */}
        </div>
    )
}
