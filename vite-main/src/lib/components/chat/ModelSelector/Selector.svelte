<script lang="ts">
        import { DropdownMenu } from 'bits-ui';
        import { marked } from 'marked';
        import Fuse from 'fuse.js';

        import dayjs from '$lib/dayjs';
        import relativeTime from 'dayjs/plugin/relativeTime';
        dayjs.extend(relativeTime);

        import Spinner from '$lib/components/common/Spinner.svelte';
        import { flyAndScale } from '$lib/utils/transitions';
        import { createEventDispatcher, onMount, getContext, tick } from 'svelte';
        import { goto } from '$app/navigation';

        import {
                user,
                MODEL_DOWNLOAD_POOL,
                models,
                mobile,
                temporaryChatEnabled,
                settings,
                config
        } from '$lib/stores';
        import { toast } from 'svelte-sonner';
        import { capitalizeFirstLetter, sanitizeResponseContent, splitStream } from '$lib/utils';
        import { getModels } from '$lib/apis';

        import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
        import Check from '$lib/components/icons/Check.svelte';
        import Search from '$lib/components/icons/Search.svelte';
        import Tooltip from '$lib/components/common/Tooltip.svelte';
        import Switch from '$lib/components/common/Switch.svelte';
        import ChatBubbleOval from '$lib/components/icons/ChatBubbleOval.svelte';

        import ModelItem from './ModelItem.svelte';

        const i18n = getContext('i18n');
        const dispatch = createEventDispatcher();

        export let id = '';
        export let value = '';
        export let placeholder = $i18n.t('Select a model');
        export let searchEnabled = true;
        export let searchPlaceholder = $i18n.t('Search a model');

        export let items: {
                label: string;
                value: string;
                model: Model;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any;
        }[] = [];

        export let className = 'w-[12rem]';
        export let triggerClassName = 'text-lg';

        export let pinModelHandler: (modelId: string) => void = () => {};

        let tagsContainerElement;

        let show = false;
        let tags = [];

        let selectedModel = '';
        $: selectedModel = items.find((item) => item.value === value) ?? '';

        let searchValue = '';

        let selectedTag = '';
        let selectedConnectionType = '';

        let selectedModelIdx = 0;

        const fuse = new Fuse(
                items.map((item) => {
                        const _item = {
                                ...item,
                                modelName: item.model?.name,
                                tags: (item.model?.tags ?? []).map((tag) => tag.name).join(' '),
                                desc: item.model?.info?.meta?.description
                        };
                        return _item;
                }),
                {
                        keys: ['value', 'tags', 'modelName'],
                        threshold: 0.4
                }
        );

        const updateFuse = () => {
                if (fuse) {
                        fuse.setCollection(
                                items.map((item) => {
                                        const _item = {
                                                ...item,
                                                modelName: item.model?.name,
                                                tags: (item.model?.tags ?? []).map((tag) => tag.name).join(' '),
                                                desc: item.model?.info?.meta?.description
                                        };
                                        return _item;
                                })
                        );
                }
        };

        $: if (items) {
                updateFuse();
        }

        $: filteredItems = (
                searchValue
                        ? fuse
                                        .search(searchValue)
                                        .map((e) => {
                                                return e.item;
                                        })
                                        .filter((item) => {
                                                if (selectedTag === '') {
                                                        return true;
                                                }

                                                return (item.model?.tags ?? [])
                                                        .map((tag) => tag.name.toLowerCase())
                                                        .includes(selectedTag.toLowerCase());
                                        })
                                        .filter((item) => {
                                                if (selectedConnectionType === '') {
                                                        return true;
                                                } else if (selectedConnectionType === 'local') {
                                                        return item.model?.connection_type === 'local';
                                                } else if (selectedConnectionType === 'external') {
                                                        return item.model?.connection_type === 'external';
                                                } else if (selectedConnectionType === 'direct') {
                                                        return item.model?.direct;
                                                }
                                        })
                        : items
                                        .filter((item) => {
                                                if (selectedTag === '') {
                                                        return true;
                                                }
                                                return (item.model?.tags ?? [])
                                                        .map((tag) => tag.name.toLowerCase())
                                                        .includes(selectedTag.toLowerCase());
                                        })
                                        .filter((item) => {
                                                if (selectedConnectionType === '') {
                                                        return true;
                                                } else if (selectedConnectionType === 'local') {
                                                        return item.model?.connection_type === 'local';
                                                } else if (selectedConnectionType === 'external') {
                                                        return item.model?.connection_type === 'external';
                                                } else if (selectedConnectionType === 'direct') {
                                                        return item.model?.direct;
                                                }
                                        })
        ).filter((item) => !(item.model?.info?.meta?.hidden ?? false));

        $: if (selectedTag || selectedConnectionType) {
                resetView();
        } else {
                resetView();
        }

        const resetView = async () => {
                await tick();

                const selectedInFiltered = filteredItems.findIndex((item) => item.value === value);

                if (selectedInFiltered >= 0) {
                        // The selected model is visible in the current filter
                        selectedModelIdx = selectedInFiltered;
                } else {
                        // The selected model is not visible, default to first item in filtered list
                        selectedModelIdx = 0;
                }

                await tick();
                const item = document.querySelector(`[data-arrow-selected="true"]`);
                item?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
        };

        const pullModelHandler = async () => {
                toast.info($i18n.t('Model pulling is not available'));
        };

        onMount(async () => {
                if (items) {
                        tags = items
                                .filter((item) => !(item.model?.info?.meta?.hidden ?? false))
                                .flatMap((item) => item.model?.tags ?? [])
                                .map((tag) => tag.name.toLowerCase());
                        // Remove duplicates and sort
                        tags = Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));
                }
        });

        const cancelModelPullHandler = async (model: string) => {
                const { reader, abortController } = $MODEL_DOWNLOAD_POOL[model];
                if (abortController) {
                        abortController.abort();
                }
                if (reader) {
                        await reader.cancel();
                        delete $MODEL_DOWNLOAD_POOL[model];
                        MODEL_DOWNLOAD_POOL.set({
                                ...$MODEL_DOWNLOAD_POOL
                        });
                        toast.success($i18n.t('{{model}} download has been canceled', { model: model }));
                }
        };

        const unloadModelHandler = async (model: string) => {
                toast.info($i18n.t('Model unloading is not available'));
        };
</script>

<DropdownMenu.Root
        bind:open={show}
        onOpenChange={async () => {
                searchValue = '';
                window.setTimeout(() => document.getElementById('model-search-input')?.focus(), 0);

                resetView();
        }}
        closeFocus={false}
>
        <DropdownMenu.Trigger
                class="relative w-full {($settings?.highContrastMode ?? false)
                        ? ''
                        : 'outline-hidden focus:outline-hidden'}"
                aria-label={placeholder}
                id="model-selector-{id}-button"
        >
                <div
                        class="flex w-full text-left px-0.5 bg-transparent truncate {triggerClassName} justify-between {($settings?.highContrastMode ??
                        false)
                                ? 'dark:placeholder-gray-100 placeholder-gray-800'
                                : 'placeholder-gray-400'}"
                        on:mouseenter={async () => {
                                models.set(
                                        await getModels(
                                                localStorage.token,
                                                $config?.features?.enable_direct_connections && ($settings?.directConnections ?? null)
                                        )
                                );
                        }}
                >
                        {#if selectedModel}
                                {selectedModel.label}
                        {:else}
                                {placeholder}
                        {/if}
                        <ChevronDown className=" self-center ml-2 size-3" strokeWidth="2.5" />
                </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
                class="{className} max-w-[calc(100vw-1rem)] rounded-2xl p-2 border border-gray-100 dark:border-gray-800 z-40 bg-white dark:bg-gray-850 dark:text-white shadow-lg outline-hidden"
                transition={flyAndScale}
                side={$mobile ? 'bottom' : 'bottom-start'}
                sideOffset={4}
                alignOffset={-1}
        >
                <slot>
                        <div>
                                {#if tags && items.filter((item) => !(item.model?.info?.meta?.hidden ?? false)).length > 0}
                                        <div
                                                class=" flex w-full bg-white dark:bg-gray-850 overflow-x-auto scrollbar-none font-[450] mb-0.5"
                                                on:wheel={(e) => {
                                                        if (e.deltaY !== 0) {
                                                                e.preventDefault();
                                                                e.currentTarget.scrollLeft += e.deltaY;
                                                        }
                                                }}
                                        >
                                                <div
                                                        class="flex gap-1 w-fit text-center text-sm rounded-full bg-transparent px-1.5 whitespace-nowrap"
                                                        bind:this={tagsContainerElement}
                                                >
                                                        {#if items.find((item) => item.model?.connection_type === 'local') || items.find((item) => item.model?.connection_type === 'external') || items.find((item) => item.model?.direct) || tags.length > 0}
                                                                <button
                                                                        class="min-w-fit outline-none px-1.5 py-0.5 {selectedTag === '' &&
                                                                        selectedConnectionType === ''
                                                                                ? ''
                                                                                : 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition capitalize"
                                                                        aria-pressed={selectedTag === '' && selectedConnectionType === ''}
                                                                        on:click={() => {
                                                                                selectedConnectionType = '';
                                                                                selectedTag = '';
                                                                        }}
                                                                >
                                                                        {$i18n.t('All')}
                                                                </button>
                                                        {/if}

                                                        {#if items.find((item) => item.model?.connection_type === 'local')}
                                                                <button
                                                                        class="min-w-fit outline-none px-1.5 py-0.5 {selectedConnectionType === 'local'
                                                                                ? ''
                                                                                : 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition capitalize"
                                                                        aria-pressed={selectedConnectionType === 'local'}
                                                                        on:click={() => {
                                                                                selectedTag = '';
                                                                                selectedConnectionType = 'local';
                                                                        }}
                                                                >
                                                                        {$i18n.t('Local')}
                                                                </button>
                                                        {/if}

                                                        {#if items.find((item) => item.model?.connection_type === 'external')}
                                                                <button
                                                                        class="min-w-fit outline-none px-1.5 py-0.5 {selectedConnectionType === 'external'
                                                                                ? ''
                                                                                : 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition capitalize"
                                                                        aria-pressed={selectedConnectionType === 'external'}
                                                                        on:click={() => {
                                                                                selectedTag = '';
                                                                                selectedConnectionType = 'external';
                                                                        }}
                                                                >
                                                                        {$i18n.t('External')}
                                                                </button>
                                                        {/if}

                                                        {#if items.find((item) => item.model?.direct)}
                                                                <button
                                                                        class="min-w-fit outline-none px-1.5 py-0.5 {selectedConnectionType === 'direct'
                                                                                ? ''
                                                                                : 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition capitalize"
                                                                        aria-pressed={selectedConnectionType === 'direct'}
                                                                        on:click={() => {
                                                                                selectedTag = '';
                                                                                selectedConnectionType = 'direct';
                                                                        }}
                                                                >
                                                                        {$i18n.t('Direct')}
                                                                </button>
                                                        {/if}

                                                        {#each tags as tag}
                                                                <Tooltip content="">
                                                                        <button
                                                                                class="min-w-fit outline-none px-1.5 py-0.5 {selectedTag === tag
                                                                                        ? ''
                                                                                        : 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white'} transition capitalize"
                                                                                aria-pressed={selectedTag === tag}
                                                                                on:click={() => {
                                                                                        selectedConnectionType = '';
                                                                                        selectedTag = tag;
                                                                                }}
                                                                        >
                                                                                {tag.length > 16 ? `${tag.slice(0, 16)}...` : tag}
                                                                        </button>
                                                                </Tooltip>
                                                        {/each}
                                                </div>
                                        </div>
                                {/if}
                        </div>

                        <div class="px-2.5 max-h-64 overflow-y-auto group relative">
                                {#each filteredItems as item, index}
                                        <ModelItem
                                                {selectedModelIdx}
                                                {item}
                                                {index}
                                                {value}
                                                {pinModelHandler}
                                                {unloadModelHandler}
                                                onClick={() => {
                                                        value = item.value;
                                                        selectedModelIdx = index;

                                                        show = false;
                                                }}
                                        />
                                {:else}
                                        <div class="">
                                                <div class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-100">
                                                        {$i18n.t('No results found')}
                                                </div>
                                        </div>
                                {/each}

                                {#each Object.keys($MODEL_DOWNLOAD_POOL) as model}
                                        <div
                                                class="flex w-full justify-between font-medium select-none rounded-button py-2 pl-3 pr-1.5 text-sm text-gray-700 dark:text-gray-100 outline-hidden transition-all duration-75 rounded-xl cursor-pointer data-highlighted:bg-muted"
                                        >
                                                <div class="flex">
                                                        <div class="mr-2.5 translate-y-0.5">
                                                                <Spinner />
                                                        </div>

                                                        <div class="flex flex-col self-start">
                                                                <div class="flex gap-1">
                                                                        <div class="line-clamp-1">
                                                                                Downloading "{model}"
                                                                        </div>

                                                                        <div class="shrink-0">
                                                                                {'pullProgress' in $MODEL_DOWNLOAD_POOL[model]
                                                                                        ? `(${$MODEL_DOWNLOAD_POOL[model].pullProgress}%)`
                                                                                        : ''}
                                                                        </div>
                                                                </div>

                                                                {#if 'digest' in $MODEL_DOWNLOAD_POOL[model] && $MODEL_DOWNLOAD_POOL[model].digest}
                                                                        <div class="-mt-1 h-fit text-[0.7rem] dark:text-gray-500 line-clamp-1">
                                                                                {$MODEL_DOWNLOAD_POOL[model].digest}
                                                                        </div>
                                                                {/if}
                                                        </div>
                                                </div>

                                                <div class="mr-2 ml-1 translate-y-0.5">
                                                        <Tooltip content="">
                                                                <button
                                                                        class="text-gray-800 dark:text-gray-100"
                                                                        on:click={() => {
                                                                                cancelModelPullHandler(model);
                                                                        }}
                                                                >
                                                                        <svg
                                                                                class="w-4 h-4 text-gray-800 dark:text-white"
                                                                                aria-hidden="true"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="24"
                                                                                height="24"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                        >
                                                                                <path
                                                                                        stroke="currentColor"
                                                                                        stroke-linecap="round"
                                                                                        stroke-linejoin="round"
                                                                                        stroke-width="2"
                                                                                        d="M6 18 17.94 6M18 18 6.06 6"
                                                                                />
                                                                        </svg>
                                                                </button>
                                                        </Tooltip>
                                                </div>
                                        </div>
                                {/each}
                        </div>

                        <div class="mb-2.5"></div>

                        <div class="hidden w-[42rem]" />
                        <div class="hidden w-[32rem]" />
                </slot>
        </DropdownMenu.Content>
</DropdownMenu.Root>
