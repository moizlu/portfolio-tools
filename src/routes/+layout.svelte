<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	import { theme } from '$lib/stores';
	import { onNavigate } from '$app/navigation';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	import ModalWindowEntrypoint from '$lib/components/ui/ModalWindow';
	import SplashScreen from '$lib/components/sections/SplashScreen';
	import Header from '$lib/components/sections/Header';
	import Footer from '$lib/components/sections/Footer';

	let { children } = $props();

	$effect(() => {
		const lang = getLocale();
		document.documentElement.lang = lang
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) { return; }

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();	
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<title>{m.tools()} | moizlu</title>

	<meta property="og:url" content="https://tools.moizlu.com/" />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content="ツール集(Tools) | moizlu" />
	<meta property="og:image" content="https://tools.moizlu.com/ogp.png" />
	<meta property="og:site_name" content="ツール集(Tools) | moizlu" />
	<meta property="og:description" content="ツール集(Tools) | moizlu" />

	<meta http-equiv="content-security-policy" content="
		default-src 'self';
		script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com 'unsafe-inline';
		style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
		font-src 'self' https://fonts.gstatic.com;
		connect-src 'self' https://cloudflareinsights.com;
		frame-src 'self' https://challenges.cloudflare.com;
		img-src 'self' data: https:;
	">
</svelte:head>

<ModalWindowEntrypoint />
<SplashScreen />

<Header />
<div class="w-full min-h-dvh flex flex-col">
	<div class="pt-15 flex-1">
		{@render children()}
	</div>
	<Footer />
</div>
