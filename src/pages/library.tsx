import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { KnowledgePage } from './knowledge';
import { BrainPage } from './brain';

export function LibraryPage() {
  return (
    <Tabs defaultValue="saved" className="flex flex-col h-full overflow-hidden">
      {/* Tab switcher pinned below the top nav */}
      <TabsList className="border-b border-[var(--border)] rounded-none pb-0 pt-3 px-[var(--page-px)] gap-1 bg-transparent flex-none">
        <TabsTrigger
          value="saved"
          className="rounded-none border-0 border-b-2 border-transparent pb-2 px-1 mr-3 text-[var(--text-dim)] data-[state=active]:border-[var(--cyan)] data-[state=active]:text-[var(--cyan)] data-[state=active]:bg-transparent hover:text-[var(--text)] hover:border-transparent hover:bg-transparent transition-colors h-auto text-sm font-semibold"
        >
          Saved
        </TabsTrigger>
        <TabsTrigger
          value="brain"
          className="rounded-none border-0 border-b-2 border-transparent pb-2 px-1 text-[var(--text-dim)] data-[state=active]:border-[var(--cyan)] data-[state=active]:text-[var(--cyan)] data-[state=active]:bg-transparent hover:text-[var(--text)] hover:border-transparent hover:bg-transparent transition-colors h-auto text-sm font-semibold"
        >
          Knowledge Web
        </TabsTrigger>
      </TabsList>

      <TabsContent value="saved" className="flex-1 overflow-hidden m-0">
        <KnowledgePage />
      </TabsContent>
      <TabsContent value="brain" className="flex-1 overflow-auto m-0">
        <BrainPage />
      </TabsContent>
    </Tabs>
  );
}
