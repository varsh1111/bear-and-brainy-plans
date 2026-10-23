<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep all student records in the existing PlannerProvider and `study-planner-v1` browser store to preserve the user's previously chosen account-free experience and saved data.
- Derive dashboard, subject, calendar and report statistics from shared date and study helpers so session changes update every view consistently.
- Keep study and exam forms in reusable feature widgets, with leaf routes for sidebar destinations, to avoid duplicate state or navigation-only pages.
