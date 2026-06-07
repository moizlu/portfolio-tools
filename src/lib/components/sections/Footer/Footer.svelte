<script lang="ts">
    import MailIcon from "$lib/assets/icons/mail.svelte";

    import { resolve } from "$app/paths";
    import { m } from "$lib/paraglide/messages";

    import SvgIcon from "$lib/components/ui/SvgIcon";
</script>

<footer class="w-full h-15 px-4 grid grid-cols-2 sm:grid-cols-3 text-xs sm:text-lg">
    <a href={resolve("/contact")} class="flex justify-start items-center">
        <SvgIcon Svg={MailIcon} size={30} />
        <p>{m.contact_me()}</p>
    </a>

    <div class="flex justify-end sm:justify-center items-center">
        &copy; 2026 moizlu
    </div>
</footer>
