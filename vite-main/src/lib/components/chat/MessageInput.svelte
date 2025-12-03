<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu"
  import { Textarea } from "$lib/components/ui/textarea"
  import { cn } from "$lib/utils"
  import { IconPaperclip, IconPlus, IconSearch, IconSparkles } from "@tabler/icons-svelte"

  let message = ""
  let isExpanded = false
  let isGenerating = false
  let textareaRef: HTMLTextAreaElement
  let fileInputRef: HTMLInputElement

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

  function handleFileClick() {
    fileInputRef?.click()
  }
</script>

<form on:submit={handleSubmit} class="group/composer w-full">
  <input bind:this={fileInputRef} type="file" multiple class="sr-only" on:change={() => {}} />

  <div
    class={cn(
      "w-full max-w-2xl mx-auto bg-transparent dark:bg-muted/50 cursor-text overflow-clip bg-clip-padding p-2.5 shadow-lg border border-border transition-all duration-200",
      {
        "rounded-3xl grid grid-cols-1 grid-rows-[auto_1fr_auto]": isExpanded,
        "rounded-[28px] grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]": !isExpanded,
      },
    )}
    style="grid-template-areas: {isExpanded
      ? "'header' 'primary' 'footer'"
      : "'header header header' 'leading primary trailing' '. footer .'"}"
  >
    <div
      class={cn("flex min-h-14 items-center overflow-x-hidden px-1.5", {
        "px-2 py-1 mb-0": isExpanded,
        "-my-2.5": !isExpanded,
      })}
      style="grid-area: primary"
    >
      <div class="flex-1 overflow-auto max-h-52">
        <Textarea
          bind:this={textareaRef}
          {message}
          on:input={handleTextareaChange}
          on:keydown={handleKeyDown}
          placeholder="Ask anything"
          class="min-h-0 resize-none rounded-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin dark:bg-transparent"
          rows={1}
        />
      </div>
    </div>

    <div class={cn("flex", { hidden: isExpanded })} style="grid-area: leading">
      <DropdownMenu>
        <DropdownMenuTrigger asChild let:builder>
          <Button
            builders={[builder]}
            type="button"
            variant="ghost"
            size="icon"
            class="h-9 w-9 rounded-full hover:bg-accent outline-none ring-0"
          >
            <IconPlus class="size-6 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" class="max-w-xs rounded-2xl p-1.5">
          <DropdownMenuGroup class="space-y-1">
            <DropdownMenuItem class="rounded-[calc(1rem-6px)]" on:click={handleFileClick}>
              <IconPaperclip size={20} class="opacity-60" />
              Add photos & files
            </DropdownMenuItem>
            <DropdownMenuItem class="rounded-[calc(1rem-6px)]" on:click={() => {}}>
              <div class="flex items-center gap-2">
                <IconSparkles size={20} class="opacity-60" />
                Agent mode
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem class="rounded-[calc(1rem-6px)]" on:click={() => {}}>
              <IconSearch size={20} class="opacity-60" />
              Deep Research
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="flex items-center gap-2" style="grid-area: {isExpanded ? 'footer' : 'trailing'}">
      <div class="ms-auto flex items-center gap-1.5">
        <Button type="submit" size="icon" class="h-9 w-9 rounded-full">
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
        </Button>
      </div>
    </div>
  </div>
</form>
