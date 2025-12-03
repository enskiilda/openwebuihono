<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import type { Model } from '$lib/stores';

	const dispatch = createEventDispatcher();
	const i18n = getContext('i18n');

	function cn(...inputs: (string | undefined | null | false)[]): string {
		return inputs.filter(Boolean).join(' ');
	}

	// Required exports for parent components
	export let onChange: Function = () => {};
	export let createMessagePair: Function;
	export let stopResponse: Function;

	export let autoScroll = false;
	export let generating = false;

	export let atSelectedModel: Model | undefined = undefined;
	export let selectedModels: string[] = [''];

	export let history: any = null;
	export let taskIds: any = null;

	export let prompt = '';
	export let files: any[] = [];

	export let selectedToolIds: string[] = [];
	export let selectedFilterIds: string[] = [];

	export let imageGenerationEnabled = false;
	export let webSearchEnabled = false;
	export let codeInterpreterEnabled = false;

	export let showCommands = false;
	export let placeholder = '';
	export let toolServers: any[] = [];

	// Exported functions for parent component
	export const setText = async (text?: string, cb?: (text: string) => void) => {
		prompt = text || '';
		if (cb) await cb(prompt);
	};

	// Internal state
	let isExpanded = false;
	let dropdownOpen = false;
	let textareaRef: HTMLTextAreaElement | null = null;
	let fileInputRef: HTMLInputElement | null = null;

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (prompt.trim()) {
			dispatch('submit', { prompt, files });
			
			if (createMessagePair) {
				createMessagePair(prompt);
			}

			prompt = '';
			files = [];
			isExpanded = false;

			if (textareaRef) {
				textareaRef.style.height = 'auto';
			}
		}
	}

	function handleTextareaChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		prompt = target.value;

		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = `${textareaRef.scrollHeight}px`;
		}

		isExpanded = target.value.length > 100 || target.value.includes('\n');

		onChange({
			prompt,
			files,
			selectedToolIds,
			selectedFilterIds,
			imageGenerationEnabled,
			webSearchEnabled,
			codeInterpreterEnabled
		});
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			const newFiles = Array.from(target.files).map(file => ({
				type: file.type.startsWith('image/') ? 'image' : 'file',
				file: file,
				name: file.name,
				size: file.size
			}));
			files = [...files, ...newFiles];
			dispatch('upload', { files: newFiles });
		}
	}
</script>

<form on:submit={handleSubmit} class="group/composer w-full">
	<input 
		bind:this={fileInputRef} 
		type="file" 
		multiple 
		class="sr-only" 
		on:change={handleFileChange} 
	/>

	<div
		class={cn(
			'w-full max-w-2xl mx-auto bg-transparent dark:bg-muted/50 cursor-text overflow-clip bg-clip-padding p-2.5 shadow-lg border border-border transition-all duration-200',
			isExpanded
				? 'rounded-3xl grid grid-cols-1 grid-rows-[auto_1fr_auto]'
				: 'rounded-[28px] grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]'
		)}
		style:grid-template-areas={isExpanded
			? "'header' 'primary' 'footer'"
			: "'header header header' 'leading primary trailing' '. footer .'"}
	>
		<div
			class={cn(
				'flex min-h-14 items-center overflow-x-hidden px-1.5',
				isExpanded ? 'px-2 py-1 mb-0' : '-my-2.5'
			)}
			style:grid-area="primary"
		>
			<div class="flex-1 overflow-auto max-h-52">
				<textarea
					bind:this={textareaRef}
					bind:value={prompt}
					on:input={handleTextareaChange}
					on:keydown={handleKeyDown}
					placeholder={placeholder || $i18n?.t('Ask anything') || 'Ask anything'}
					class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full bg-transparent text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-0 resize-none rounded-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin dark:bg-transparent"
					rows={1}
				></textarea>
			</div>
		</div>

		<div class={cn('flex', isExpanded && 'hidden')} style:grid-area="leading">
			<div class="relative">
				<button
					type="button"
					on:click={() => (dropdownOpen = !dropdownOpen)}
					class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 h-9 w-9 rounded-full hover:bg-accent"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6 text-muted-foreground">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
				</button>

				{#if dropdownOpen}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="fixed inset-0 z-40"
						on:click={() => (dropdownOpen = false)}
					></div>
					<div class="absolute top-full mt-2 left-0 bg-popover text-popover-foreground rounded-2xl border border-border p-1.5 shadow-md z-50 min-w-[12rem] max-w-xs">
						<button
							type="button"
							on:click={() => {
								fileInputRef?.click();
								dropdownOpen = false;
							}}
							class="w-full focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-[calc(1rem-6px)] px-2 py-1.5 text-sm outline-hidden select-none text-left hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-60">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
								<polyline points="17 8 12 3 7 8"></polyline>
								<line x1="12" y1="3" x2="12" y2="15"></line>
							</svg>
							{$i18n?.t('Add photos & files') || 'Add photos & files'}
						</button>
						<button
							type="button"
							on:click={() => (dropdownOpen = false)}
							class="w-full focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-[calc(1rem-6px)] px-2 py-1.5 text-sm outline-hidden select-none text-left hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-60">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5m-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11m3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5"></path>
							</svg>
							{$i18n?.t('Agent mode') || 'Agent mode'}
						</button>
						<button
							type="button"
							on:click={() => (dropdownOpen = false)}
							class="w-full focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-[calc(1rem-6px)] px-2 py-1.5 text-sm outline-hidden select-none text-left hover:bg-accent hover:text-accent-foreground transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-60">
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.35-4.35"></path>
							</svg>
							{$i18n?.t('Deep Research') || 'Deep Research'}
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-2" style:grid-area={isExpanded ? 'footer' : 'trailing'}>
			<div class="ms-auto flex items-center gap-1.5">
				{#if generating}
					<button
						type="button"
						on:click={() => stopResponse && stopResponse()}
						class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 size-9 h-9 w-9 rounded-full"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-square-icon lucide-square"
						>
							<rect width="18" height="18" x="3" y="3" rx="2" />
						</svg>
					</button>
				{:else}
					<button
						type="submit"
						class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 size-9 h-9 w-9 rounded-full"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-arrow-up-icon lucide-arrow-up"
						>
							<path d="m5 12 7-7 7 7" />
							<path d="M12 19V5" />
						</svg>
					</button>
				{/if}
			</div>
		</div>
	</div>
</form>
