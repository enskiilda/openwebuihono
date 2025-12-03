<script lang="ts">
  import { IconPaperclip, IconPlus, IconSearch, IconSparkles } from "@tabler/icons-svelte"

  function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(" ")
  }

  let message = ""
  let isExpanded = false
  let isGenerating = false
  let textareaRef: HTMLTextAreaElement | null = null
  let fileInputRef: HTMLInputElement | null = null
  let dropdownOpen = false

  function handleSubmit(e: Event) {
    e.preventDefault()

    if (message.trim()) {
      isGenerating = true
      message = ""
      isExpanded = false

      if (textareaRef) {
        textareaRef.style.height = "auto"
      }

      setTimeout(() => {
        isGenerating = false
      }, 3000)
    }
  }

  function handleTextareaChange(e: Event) {
    const target = e.target as HTMLTextAreaElement
    message = target.value

    if (textareaRef) {
      textareaRef.style.height = "auto"
      textareaRef.style.height = `${textareaRef.scrollHeight}px`
    }

    isExpanded = target.value.length > 100 || target.value.includes("\n")
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
</script>

<form on:submit={handleSubmit} class="group/composer w-full">
  <input bind:this={fileInputRef} type="file" multiple class="sr-only" on:change={() => {}} />

  <div
    class={cn(
      "w-full max-w-2xl mx-auto bg-transparent dark:bg-muted/50 cursor-text overflow-clip bg-clip-padding p-2.5 shadow-lg border border-border transition-all duration-200",
      isExpanded
        ? "rounded-3xl grid grid-cols-1 grid-rows-[auto_1fr_auto]"
        : "rounded-[28px] grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]",
    )}
    style:grid-template-areas={isExpanded
      ? "'header' 'primary' 'footer'"
      : "'header header header' 'leading primary trailing' '. footer .'"}
  >
    <div
      class={cn(
        "flex min-h-14 items-center overflow-x-hidden px-1.5",
        isExpanded ? "px-2 py-1 mb-0" : "-my-2.5",
      )}
      style:grid-area="primary"
    >
      <div class="flex-1 overflow-auto max-h-52">
        <textarea
          bind:this={textareaRef}
          bind:value={message}
          on:input={handleTextareaChange}
          on:keydown={handleKeyDown}
          placeholder="Ask anything"
          class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full bg-transparent text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-0 resize-none rounded-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin dark:bg-transparent"
          rows={1}
        />
      </div>
    </div>

    <div class={cn("flex", isExpanded && "hidden")} style:grid-area="leading">
      <div class="relative">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 h-9 w-9 rounded-full hover:bg-accent"
          on:click={() => (dropdownOpen = !dropdownOpen)}
        >
          <IconPlus class="size-6 text-muted-foreground" />
        </button>

        {#if dropdownOpen}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="fixed inset-0 z-40"
            on:click={() => (dropdownOpen = false)}
          />
          <div
            class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md max-w-xs rounded-2xl p-1.5 absolute top-full mt-1 left-0"
          >
            <div class="space-y-1">
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-[calc(1rem-6px)]"
                on:click={() => {
                  fileInputRef?.click()
                  dropdownOpen = false
                }}
              >
                <IconPaperclip size={20} class="opacity-60" />
                Add photos & files
              </div>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-[calc(1rem-6px)]"
                on:click={() => {
                  dropdownOpen = false
                }}
              >
                <div class="flex items-center gap-2">
                  <IconSparkles size={20} class="opacity-60" />
                  Agent mode
                </div>
              </div>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-[calc(1rem-6px)]"
                on:click={() => {
                  dropdownOpen = false
                }}
              >
                <IconSearch size={20} class="opacity-60" />
                Deep Research
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex items-center gap-2" style:grid-area={isExpanded ? "footer" : "trailing"}>
      <div class="ms-auto flex items-center gap-1.5">
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 size-9 h-9 w-9 rounded-full"
        >
          {#if isGenerating}
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
          {:else}
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
          {/if}
        </button>
      </div>
    </div>
  </div>
</form>
