          {/* Sticky Action Panel */}
          <div className="sticky top-[80%] translate-y-[-80%] self-end z-10">
            <div className="bg-secondary rounded-3xl p-4 ring-1 ring-success/20 shadow-xl shadow-success/30">
              <div className="flex flex-col gap-3">
                <Button
                  className="rounded-2xl px-4 py-2 flex items-center gap-2"
                  variant="flat"
                  size="sm"
                >
                  <RefreshCcw className="w-5 h-5" />
                  <span>Refresh</span>
                </Button>
                <Button
                  className="rounded-2xl px-4 py-2 flex items-center gap-2"
                  variant="flat"
                  size="sm"
                >
                  <TriangleAlert className="w-5 h-5" />
                  <span>Test Alert</span>
                </Button>
              </div>
            </div>
          </div>