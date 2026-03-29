      {/* Barra de Filtros Compacta */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        {/* Fila 1: Filtros Rápidos + Botón Avanzados */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="🔍 Buscar cliente, factura o descripción..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="h-10"
            />
          </div>

          {/* Cliente */}
          <Select 
            value={filters.clientId} 
            onValueChange={(value) => setFilters({ ...filters, clientId: value })}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Estado */}
          <Select 
            value={filters.status} 
            onValueChange={(value) => setFilters({ ...filters, status: value as AccountReceivableStatus | "all" })}
          >
            <SelectTrigger className="w-[150px] h-10">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={AccountReceivableStatus.PENDING}>Pendiente</SelectItem>
              <SelectItem value={AccountReceivableStatus.PARTIAL}>Parcial</SelectItem>
              <SelectItem value={AccountReceivableStatus.PAID}>Pagado</SelectItem>
              <SelectItem value={AccountReceivableStatus.OVERDUE}>Vencido</SelectItem>
            </SelectContent>
          </Select>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 ml-auto">
            <Sheet open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Más Filtros
                  {(() => {
                    const count = [
                      filters.projectId !== "all",
                      filters.categoryId !== "all",
                      filters.invoiceNumber,
                      filters.dateFrom,
                      filters.dueDateFrom,
                      filters.minAmount,
                      filters.minBalance,
                    ].filter(Boolean).length
                    return count > 0 && <Badge variant="secondary" className="ml-2">{count}</Badge>
                  })()}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtros Avanzados</SheetTitle>
                  <SheetDescription>
                    Configura filtros adicionales
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  {/* Proyecto */}
                  <div className="space-y-2">
                    <Label>Proyecto</Label>
                    <Select 
                      value={filters.projectId} 
                      onValueChange={(value) => setFilters({ ...filters, projectId: value })}
                      disabled={!filters.clientId || filters.clientId === "all"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filterProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.nombreProyecto || project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select 
                      value={filters.categoryId} 
                      onValueChange={(value) => setFilters({ ...filters, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Folio */}
                  <div className="space-y-2">
                    <Label>Folio de Factura</Label>
                    <Input
                      placeholder="FAC-001"
                      value={filters.invoiceNumber}
                      onChange={(e) => setFilters({ ...filters, invoiceNumber: e.target.value })}
                    />
                  </div>

                  {/* Fechas de Emisión */}
                  <div className="space-y-2">
                    <Label>Fecha de Emisión</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yy", { locale: es }) : "Desde"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dateFrom} 
                            onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dateTo ? format(filters.dateTo, "dd/MM/yy", { locale: es }) : "Hasta"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dateTo} 
                            onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Fechas de Vencimiento */}
                  <div className="space-y-2">
                    <Label>Fecha de Vencimiento</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dueDateFrom ? format(filters.dueDateFrom, "dd/MM/yy", { locale: es }) : "Desde"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dueDateFrom} 
                            onSelect={(date) => setFilters({ ...filters, dueDateFrom: date })}
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {filters.dueDateTo ? format(filters.dueDateTo, "dd/MM/yy", { locale: es }) : "Hasta"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar 
                            mode="single" 
                            selected={filters.dueDateTo} 
                            onSelect={(date) => setFilters({ ...filters, dueDateTo: date })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Rangos de Monto */}
                  <div className="space-y-2">
                    <Label>Monto Total</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minAmount}
                        onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Rangos de Saldo */}
                  <div className="space-y-2">
                    <Label>Saldo Pendiente</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minBalance}
                        onChange={(e) => setFilters({ ...filters, minBalance: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxBalance}
                        onChange={(e) => setFilters({ ...filters, maxBalance: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        handleClearFilters()
                        setIsAdvancedFiltersOpen(false)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Limpiar
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        handleApplyFilters()
                        setIsAdvancedFiltersOpen(false)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aplicar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              size="sm" 
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="h-10"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              className="h-10"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fila 2: Chips de Filtros Activos */}
        {(() => {
          const chips: { label: string; onRemove: () => void }[] = []
          
          if (filters.search) chips.push({ 
            label: `Búsqueda: ${filters.search}`,
            onRemove: () => setFilters({ ...filters, search: '' })
          })
          if (filters.clientId !== "all") {
            const client = clients.find(c => c.id === filters.clientId)
            chips.push({ 
              label: `Cliente: ${client?.name}`,
              onRemove: () => setFilters({ ...filters, clientId: 'all' })
            })
          }
          if (filters.projectId !== "all") {
            const project = filterProjects.find(p => p.id === filters.projectId)
            chips.push({ 
              label: `Proyecto: ${project?.nombreProyecto || project?.name}`,
              onRemove: () => setFilters({ ...filters, projectId: 'all' })
            })
          }
          if (filters.categoryId !== "all") {
            const category = categories.find(c => c.id === filters.categoryId)
            chips.push({ 
              label: `Categoría: ${category?.name}`,
              onRemove: () => setFilters({ ...filters, categoryId: 'all' })
            })
          }
          if (filters.status !== "all") {
            chips.push({ 
              label: `Estado: ${filters.status}`,
              onRemove: () => setFilters({ ...filters, status: 'all' })
            })
          }
          if (filters.invoiceNumber) {
            chips.push({ 
              label: `Factura: ${filters.invoiceNumber}`,
              onRemove: () => setFilters({ ...filters, invoiceNumber: '' })
            })
          }

          return chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className="px-2 py-1 cursor-pointer hover:bg-destructive/10"
                  onClick={chip.onRemove}
                >
                  {chip.label}
                  <XCircle className="ml-1.5 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )
        })()}
      </div>
