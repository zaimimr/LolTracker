import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getKeyboardShortcut } from "@/lib/utils";
import { KofiButton } from "@/components/ui/kofi-button";
import { AdBanner } from "@/components/ui/ad-banner";

const STORAGE_KEY = "champion_sets";

interface Champion {
  id: string;
  name: string;
  title: string;
}

interface Sets {
  [key: string]: string[];
}

export default function ChampionTracker() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [search, setSearch] = useState("");
  const [sets, setSets] = useState<Sets>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });
  const [currentSet, setCurrentSet] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsedSets = stored ? JSON.parse(stored) : {};
    const setNames = Object.keys(parsedSets);
    return setNames.length > 0 ? setNames[0] : null;
  });
  const [filterMode, setFilterMode] = useState<
    "all" | "incomplete" | "complete"
  >("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [latestVersion, setLatestVersion] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcutText, setShortcutText] = useState("⌘K");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuOpen && !(e.target as Element).closest(".menu-dropdown")) {
        setMenuOpen(false);
      }
      if (filterOpen && !(e.target as Element).closest(".filter-dropdown")) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen, filterOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  }, [sets]);

  useEffect(() => {
    setShortcutText(getKeyboardShortcut());
  }, []);

  useEffect(() => {
    async function fetchChampions() {
      const versionRes = await fetch(
        "https://ddragon.leagueoflegends.com/api/versions.json"
      );
      const [latest] = await versionRes.json();
      setLatestVersion(latest);
      const dataRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latest}/data/en_US/champion.json`
      );
      const data = await dataRes.json();
      setChampions(Object.values(data.data));
    }
    fetchChampions();
  }, []);

  const createSet = (setName: string) => {
    if (setName.trim()) {
      setSets({ ...sets, [setName.trim()]: [] });
      setCurrentSet(setName.trim());
    }
  };

  const toggleChampion = (championId: string) => {
    if (!currentSet) return;
    const currentArray = sets[currentSet] || [];
    const updatedArray = currentArray.includes(championId)
      ? currentArray.filter((id) => id !== championId)
      : [...currentArray, championId];
    setSets({ ...sets, [currentSet]: updatedArray });
  };

  const filteredChampions = champions.filter((champ) => {
    const isCompleted = currentSet && sets[currentSet]?.includes(champ.id);
    const matchesSearch = champ.name
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === "incomplete" && isCompleted) return false;
    if (filterMode === "complete" && !isCompleted) return false;

    return true;
  });

  const exportSet = async () => {
    if (!currentSet) return;
    try {
      const dataStr = JSON.stringify(sets[currentSet], null, 2);
      await navigator.clipboard.writeText(dataStr);

      const notification = document.createElement("div");
      notification.textContent = "Set copied to clipboard!";
      notification.className =
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    } catch {
      const notification = document.createElement("div");
      notification.textContent = "Failed to copy to clipboard";
      notification.className =
        "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  };

  const importSet = () => {
    if (!currentSet) return;
    const json = prompt("Paste set JSON data:");
    if (!json?.trim()) return;

    try {
      const parsed = JSON.parse(json);

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid format");
      }

      setSets({ ...sets, [currentSet]: parsed });

      const notification = document.createElement("div");
      notification.textContent = "Set imported successfully!";
      notification.className =
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    } catch {
      const notification = document.createElement("div");
      notification.textContent = "Invalid JSON format";
      notification.className =
        "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  };

  const deleteSet = (setName: string) => {
    if (confirm(`Delete set "${setName}"?`)) {
      const newSets = { ...sets };
      delete newSets[setName];
      setSets(newSets);
      if (currentSet === setName) setCurrentSet(null);
    }
  };

  return (
    <div className="dark bg-black text-white min-h-screen p-4">
      {/* Set Selection at Top */}
      <div className="mb-6">
        <div className="mb-3">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">
            Sets
          </h3>
        </div>
        {Object.keys(sets).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.keys(sets).map((setName) => {
              const completedCount = (sets[setName] || []).length;
              const completionRate =
                champions.length > 0
                  ? (completedCount / champions.length) * 100
                  : 0;
              return (
                <div
                  key={setName}
                  className={`relative group rounded-lg border transition-all duration-200 ${
                    currentSet === setName
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <button
                    onClick={() => setCurrentSet(setName)}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium truncate ${
                          currentSet === setName
                            ? "text-blue-400"
                            : "text-white"
                        }`}
                      >
                        {setName}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSet(setName);
                        }}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                        title={`Delete ${setName}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      {completedCount} / {champions.length} champions
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          currentSet === setName ? "bg-blue-500" : "bg-gray-500"
                        }`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </button>
                </div>
              );
            })}
            {/* Create New Set Card */}
            <div className="relative group rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/40 transition-all duration-200">
              <button
                onClick={() => {
                  const setName = prompt("Enter new set name:");
                  if (setName?.trim()) {
                    createSet(setName);
                  }
                }}
                className="w-full p-3 text-center flex flex-col items-center justify-center min-h-[68px]"
              >
                <div className="text-xl text-gray-500 mb-0.5">+</div>
                <span className="text-xs font-medium text-gray-400">
                  New Set
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Create a set to start tracking your champion progress</p>
            <Button
              onClick={() => {
                const setName = prompt("Enter set name:");
                if (setName?.trim()) {
                  createSet(setName);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Set
            </Button>
          </div>
        )}
      </div>

      {/* Top Ad - Only shows with sufficient content */}
      {currentSet &&
       search === "" &&
       filterMode === "all" &&
       champions.length >= 100 && (
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-3xl">
            <AdBanner slot="6963866073" />
          </div>
        </div>
      )}

      {/* Current Set Progress */}
      {currentSet && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl mb-2">Current Set: {currentSet}</h2>
          <div className="text-sm text-gray-400">
            Champion Progress: {(sets[currentSet] || []).length} / {champions.length}{" "}
            champions completed ({Math.round(((sets[currentSet] || []).length / champions.length) * 100)}%)
          </div>
        </div>
      )}

      {/* Champion Search and Menu */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={`Search champions... (${shortcutText})`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative filter-dropdown">
              <Button
                onClick={() => setFilterOpen(!filterOpen)}
                variant="outline"
                size="sm"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 relative"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.172a1 1 0 01-.293.707l-2 2A1 1 0 0111 20.586V13.414a1 1 0 00-.293-.707L4.293 6.293A1 1 0 014 5.586V4z"
                  />
                </svg>
                Filter
                {filterMode !== "all" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </Button>
              {filterOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setFilterMode("all");
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        filterMode === "all"
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("incomplete");
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        filterMode === "incomplete"
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Incomplete Only
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("complete");
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        filterMode === "complete"
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Complete Only
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative menu-dropdown">
              <Button
                onClick={() => setMenuOpen(!menuOpen)}
                variant="outline"
                size="sm"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
              >
                ⋮
              </Button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    {currentSet && (
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => {
                            exportSet();
                            setMenuOpen(false);
                          }}
                          className="text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                        >
                          Export Current Set
                        </Button>
                        <Button
                          onClick={() => {
                            importSet();
                            setMenuOpen(false);
                          }}
                          className="text-left justify-start text-sm h-8 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                        >
                          Import to Current Set
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Champion Grid */}
      <div className="flex gap-6">
        {/* Main Champion Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredChampions.map((champ) => {
              const isCompleted = currentSet
                ? sets[currentSet]?.includes(champ.id)
                : false;

              return (
                <div
                  key={champ.id}
                  className={`relative border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    isCompleted
                      ? "border-gray-700 bg-gray-800/30"
                      : "border-gray-600 hover:border-blue-400"
                  }`}
                  onClick={() => toggleChampion(champ.id)}
                  title={champ.name}
                >
                  <div className="aspect-[16/9] relative overflow-hidden rounded-md">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`}
                      alt={champ.name}
                      className={`w-full h-full object-cover transition-all duration-200 ${
                        isCompleted ? "opacity-30 grayscale" : "opacity-100"
                      }`}
                    />
                  </div>
                  <div className="p-2">
                    <span
                      className={`text-xs block text-center truncate ${
                        isCompleted ? "text-gray-500" : "text-white"
                      }`}
                    >
                      {champ.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ad Section - Only shows with sufficient content (no filters, no search, full champion list) */}
      {currentSet &&
       search === "" &&
       filterMode === "all" &&
       filteredChampions.length >= 100 && (
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-4xl">
            <AdBanner slot="6963866073" />
          </div>
        </div>
      )}

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type to search or run commands..." />
        <CommandList>
          {/* Sets Section */}
          {Object.keys(sets).length > 0 && (
            <div className="px-2 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Sets
            </div>
          )}
          {Object.keys(sets).map((set) => (
            <CommandItem
              key={set}
              onSelect={() => {
                setCurrentSet(set);
                setCommandOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentSet === set ? "bg-blue-400" : "bg-gray-500"
                  }`}
                ></div>
                {set}
                <span className="ml-auto text-xs text-gray-400">
                  {(sets[set] || []).length}/{champions.length}
                </span>
              </div>
            </CommandItem>
          ))}

          {/* Champions Section */}
          {champions.length > 0 && (
            <div className="px-2 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
              Champions
            </div>
          )}
          {champions.map((champ: Champion) => (
            <CommandItem
              key={champ.id}
              onSelect={() => {
                setSearch(champ.name);
                setCommandOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.id}.png`}
                  alt={champ.name}
                  className="w-6 h-6 rounded"
                />
                {champ.name}
                {currentSet && sets[currentSet]?.includes(champ.id) && (
                  <span className="ml-auto text-gray-400 text-xs">✓</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          {/* Footer Ad - Only shows with sufficient content */}
          {currentSet &&
           search === "" &&
           filterMode === "all" &&
           filteredChampions.length >= 100 && (
            <div className="mb-8 flex justify-center">
              <div className="w-full">
                <AdBanner slot="6963866073" />
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} League of Legends Champion Tracker. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                League of Legends is a trademark of Riot Games, Inc.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <KofiButton username="zaimimr" />
              <a
                href="https://github.com/zaimimr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
