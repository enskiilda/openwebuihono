<script>
        import { Toaster } from 'svelte-sonner';
        import { browser } from '$app/environment';

        import { onMount, setContext } from 'svelte';
        import {
                config,
                user,
                settings,
                theme,
                WEBUI_NAME,
                mobile,
                models
        } from '$lib/stores';

        import i18n, { initI18n } from '$lib/i18n';
        import { NVIDIA_MODELS } from '$lib/apis/nvidia';

        import '../tailwind.css';
        import '../app.css';

        import { WEBUI_BASE_URL } from '$lib/constants';

        setContext('i18n', i18n);

        const BREAKPOINT = 768;

        const mockConfig = {
                status: true,
                name: 'Open WebUI',
                version: '0.6.40',
                default_locale: 'pl-PL',
                default_models: 'nvidia:moonshotai/kimi-k2-instruct-0905',
                default_prompt_suggestions: [
                        { content: 'Help me study', title: ['Help me study', 'vocabulary for a college entrance exam'] },
                        { content: 'Give me ideas', title: ['Give me ideas', 'for what to do with my kids art'] },
                        { content: 'Tell me a fun fact', title: ['Tell me a fun fact', 'about the Roman Empire'] },
                        { content: 'Show me a code snippet', title: ['Show me a code snippet', 'of a website sticky header'] }
                ],
                features: {
                        auth: false,
                        auth_trusted_header: false,
                        enable_api_keys: true,
                        enable_signup: true,
                        enable_login_form: true,
                        enable_web_search: true,
                        enable_google_drive_integration: false,
                        enable_onedrive_integration: false,
                        enable_image_generation: true,
                        enable_admin_export: true,
                        enable_admin_chat_access: true,
                        enable_community_sharing: true,
                        enable_autocomplete_generation: true,
                        enable_direct_connections: true,
                        enable_version_update_check: false
                },
                oauth: {
                        providers: {}
                }
        };

        const mockUser = {
                id: 'user',
                email: 'user@localhost',
                name: 'User',
                role: 'admin',
                profile_image_url: '/static/favicon.png',
                permissions: {
                        chat: {
                                temporary_enforced: false,
                                multiple_models: true
                        },
                        features: {
                                image_generation: true,
                                code_interpreter: true,
                                web_search: true
                        }
                }
        };

        const nvidiaModelsForStore = NVIDIA_MODELS.map(m => ({
                ...m,
                info: {
                        meta: {
                                capabilities: {
                                        vision: false,
                                        usage: true
                                }
                        }
                }
        }));

        function cleanupDuplicateChats() {
                try {
                        localStorage.removeItem('openwebui_local_chats');
                        localStorage.removeItem('chats');
                } catch (e) {
                        console.warn('Failed to cleanup chats:', e);
                }
        }

        if (browser) {
                cleanupDuplicateChats();
                config.set(mockConfig);
                WEBUI_NAME.set(mockConfig.name);
                user.set(mockUser);
                models.set(nvidiaModelsForStore);
                theme.set('light');
                mobile.set(window.innerWidth < BREAKPOINT);
        }

        onMount(() => {
                config.set(mockConfig);
                WEBUI_NAME.set(mockConfig.name);
                user.set(mockUser);
                models.set(nvidiaModelsForStore);
                settings.set({});
                theme.set('light');
                mobile.set(window.innerWidth < BREAKPOINT);
                initI18n('pl-PL');

                const onResize = () => mobile.set(window.innerWidth < BREAKPOINT);
                window.addEventListener('resize', onResize);
                return () => window.removeEventListener('resize', onResize);
        });
</script>

<svelte:head>
        <title>{$WEBUI_NAME}</title>
        <link crossorigin="anonymous" rel="icon" href="{WEBUI_BASE_URL}/static/favicon.png" />
</svelte:head>

<slot />

<Toaster theme="dark" richColors position="top-right" />
