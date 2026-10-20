"use client";

import { useEffect, useMemo, useState } from "react";
import {
  exportProductsCSV,
  exportOrdersCSV,
  exportLeadsCSV,
  exportTasksCSV,
} from "@/lib/csv-export";

type Lead = {
  id: number;
  name: string;
  phone: string;
  area: string;
  source: string;
  interest: string;
  status: string;
  value: number;
  nextFollowUp: string;
  avatar: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  pack: string;
  price: number;
  stock: number;
};

type Order = {
  id: number;
  customer: string;
  amount: number;
  status: string;
};

type Task = {
  id: number;
  title: string;
  customer: string;
  due: string;
  type: string;
  done: boolean;
};

const leadStatuses = [
  "New",
  "Contacted",
  "Trial",
  "Converted",
  "Lost",
];

const orderStatuses = [
  "Pending",
  "Packed",
  "Out for delivery",
  "Delivered",
];

const taskTypes = [
  "Task",
  "Call",
  "WhatsApp",
  "Delivery",
];

export default function FreshCutCRM() {
  const [active, setActive] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [leadSearch, setLeadSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    area: "",
    source: "",
    interest: "",
    status: "New",
    value: "",
    nextFollowUp: "",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    pack: "",
    price: "",
    stock: "",
  });

  const [orderForm, setOrderForm] = useState({
    customer: "",
    amount: "",
    status: "Pending",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    customer: "",
    due: "",
    type: "Task",
    done: false,
  });

  const [whatsappLeadId, setWhatsappLeadId] =
    useState<number | "">("");

  const [whatsappMessage, setWhatsappMessage] =
    useState(
      "Hello, thank you for connecting with FreshCut."
    );

  const [whatsappSending, setWhatsappSending] =
    useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [message]);

  async function getList<T>(url: string): Promise<T[]> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${url}`);
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
  }

  async function loadData() {
    try {
      setLoading(true);

      const [leadData, productData, orderData, taskData] =
        await Promise.all([
          getList<Lead>("/api/leads"),
          getList<Product>("/api/products"),
          getList<Order>("/api/orders"),
          getList<Task>("/api/tasks"),
        ]);

      setLeads(leadData);
      setProducts(productData);
      setOrders(orderData);
      setTasks(taskData);
    } catch (error) {
      console.error(error);
      setMessage("Data load failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveLead() {
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      setMessage("Lead name and phone required");
      return;
    }

    const url = editingLead
      ? `/api/leads/${editingLead.id}`
      : "/api/leads";

    const method = editingLead ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim(),
        area: leadForm.area.trim(),
        source: leadForm.source.trim(),
        interest: leadForm.interest.trim(),
        status: leadForm.status,
        value: Number(leadForm.value || 0),
        nextFollowUp: leadForm.nextFollowUp.trim(),
        avatar:
          leadForm.name
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "NA",
      }),
    });

    if (!response.ok) {
      setMessage("Lead save failed");
      return;
    }

    setEditingLead(null);

    setLeadForm({
      name: "",
      phone: "",
      area: "",
      source: "",
      interest: "",
      status: "New",
      value: "",
      nextFollowUp: "",
    });

    await loadData();
    setMessage(editingLead ? "Lead updated" : "Lead added");
  }

  async function deleteLead(id: number) {
    if (!confirm("Delete this lead?")) {
      return;
    }

    const response = await fetch(`/api/leads/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Lead delete failed");
      return;
    }

    await loadData();
    setMessage("Lead deleted");
  }

  function startLeadEdit(lead: Lead) {
    setEditingLead(lead);

    setLeadForm({
      name: lead.name,
      phone: lead.phone,
      area: lead.area,
      source: lead.source,
      interest: lead.interest,
      status: lead.status,
      value: String(lead.value || 0),
      nextFollowUp: lead.nextFollowUp || "",
    });

    setActive("Leads");
  }

  async function saveProduct() {
    if (!productForm.name.trim()) {
      setMessage("Product name required");
      return;
    }

    const url = editingProduct
      ? `/api/products/${editingProduct.id}`
      : "/api/products";

    const method = editingProduct ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: productForm.name.trim(),
        category: productForm.category.trim(),
        pack: productForm.pack.trim(),
        price: Number(productForm.price || 0),
        stock: Number(productForm.stock || 0),
      }),
    });

    if (!response.ok) {
      setMessage("Product save failed");
      return;
    }

    setEditingProduct(null);

    setProductForm({
      name: "",
      category: "",
      pack: "",
      price: "",
      stock: "",
    });

    await loadData();
    setMessage(editingProduct ? "Product updated" : "Product added");
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) {
      return;
    }

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Product delete failed");
      return;
    }

    await loadData();
    setMessage("Product deleted");
  }

  function startProductEdit(product: Product) {
    setEditingProduct(product);

    setProductForm({
      name: product.name,
      category: product.category,
      pack: product.pack,
      price: String(product.price),
      stock: String(product.stock),
    });

    setActive("Products");
  }

  async function saveOrder() {
    if (!orderForm.customer.trim()) {
      setMessage("Customer name required");
      return;
    }

    const url = editingOrder
      ? `/api/orders/${editingOrder.id}`
      : "/api/orders";

    const method = editingOrder ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: orderForm.customer.trim(),
        amount: Number(orderForm.amount || 0),
        status: orderForm.status,
      }),
    });

    if (!response.ok) {
      setMessage("Order save failed");
      return;
    }

    setEditingOrder(null);

    setOrderForm({
      customer: "",
      amount: "",
      status: "Pending",
    });

    await loadData();
    setMessage(editingOrder ? "Order updated" : "Order added");
  }

  async function deleteOrder(id: number) {
    if (!confirm("Delete this order?")) {
      return;
    }

    const response = await fetch(`/api/orders/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Order delete failed");
      return;
    }

    await loadData();
    setMessage("Order deleted");
  }

  function startOrderEdit(order: Order) {
    setEditingOrder(order);

    setOrderForm({
      customer: order.customer,
      amount: String(order.amount),
      status: order.status,
    });

    setActive("Orders");
  }

  async function saveTask() {
    if (!taskForm.title.trim()) {
      setMessage("Task title required");
      return;
    }

    const url = editingTask
      ? `/api/tasks/${editingTask.id}`
      : "/api/tasks";

    const method = editingTask ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: taskForm.title.trim(),
        customer: taskForm.customer.trim(),
        due: taskForm.due.trim(),
        type: taskForm.type,
        done: taskForm.done,
      }),
    });

    if (!response.ok) {
      setMessage("Task save failed");
      return;
    }

    setEditingTask(null);

    setTaskForm({
      title: "",
      customer: "",
      due: "",
      type: "Task",
      done: false,
    });

    await loadData();
    setMessage(editingTask ? "Task updated" : "Task added");
  }

  function startTaskEdit(task: Task) {
    setEditingTask(task);

    setTaskForm({
      title: task.title,
      customer: task.customer,
      due: task.due,
      type: task.type,
      done: task.done,
    });

    setActive("Tasks");
  }

  async function deleteTask(id: number) {
    if (!confirm("Delete this task?")) {
      return;
    }

    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Task delete failed");
      return;
    }

    await loadData();
    setMessage("Task deleted");
  }

  async function toggleTask(id: number) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      setMessage("Task update failed");
      return;
    }

    await loadData();
    setMessage("Task updated");
  }

  async function sendWhatsApp() {
    const selectedLead = leads.find(
      (lead) => lead.id === whatsappLeadId
    );

    if (!selectedLead) {
      setMessage("Select a lead first");
      return;
    }

    if (!whatsappMessage.trim()) {
      setMessage("Message required");
      return;
    }

    try {
      setWhatsappSending(true);

      const response = await fetch(
        "/api/social/whatsapp/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: selectedLead.phone,
            message: whatsappMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.error ||
            "WhatsApp message failed"
        );
        return;
      }

      setMessage("WhatsApp message sent");
    } catch (error) {
      console.error(error);
      setMessage("WhatsApp connection failed");
    } finally {
      setWhatsappSending(false);
    }
  }

  const selectedWhatsappLead = leads.find(
    (lead) => lead.id === whatsappLeadId
  );

  const revenue = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + Number(order.amount || 0),
        0
      ),
    [orders]
  );

  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.price || 0) *
            Number(product.stock || 0),
        0
      ),
    [products]
  );

  const filteredLeads = leads.filter((lead) =>
    `${lead.name} ${lead.phone} ${lead.area} ${lead.source} ${lead.interest} ${lead.status}`
      .toLowerCase()
      .includes(
        leadSearch.toLowerCase()
      )
  );

  const filteredProducts = products.filter(
    (product) =>
      `${product.name} ${product.category} ${product.pack}`
        .toLowerCase()
        .includes(
          productSearch.toLowerCase()
        )
  );

  const filteredOrders = orders.filter(
    (order) =>
      `${order.customer} ${order.status}`
        .toLowerCase()
        .includes(
          orderSearch.toLowerCase()
        )
  );

  const newLeads = leads.filter(
    (lead) => lead.status === "New"
  ).length;

  const convertedLeads = leads.filter(
    (lead) => lead.status === "Converted"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.done
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.done
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock) < 20
  );

  const navItems = [
    "Dashboard",
    "Leads",
    "Products",
    "Orders",
    "Tasks",
    "WhatsApp",
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 bg-slate-900 p-5 text-white">
          <h1 className="mb-8 text-2xl font-bold leading-tight">
            FreshCut CRM Pro
            <br />
            V2
          </h1>

          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() =>
                  setActive(item)
                }
                className={`block w-full rounded-lg px-4 py-3 text-left font-semibold transition ${
                  active === item
                    ? "bg-green-600"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          {message && (
            <div className="fixed right-6 top-6 z-50 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white shadow-sm">
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl bg-white p-8 text-xl font-semibold">
              Loading CRM...
            </div>
          ) : (
            <>
              {active === "Dashboard" && (
                <Dashboard
                  revenue={revenue}
                  inventoryValue={inventoryValue}
                  leads={leads}
                  products={products}
                  orders={orders}
                  pendingTasks={pendingTasks}
                  completedTasks={completedTasks}
                  lowStockProducts={
                    lowStockProducts
                  }
                  setActive={setActive}
                />
              )}

              {active === "Leads" && (
                <LeadsPage
                  leads={leads}
                  filteredLeads={filteredLeads}
                  leadSearch={leadSearch}
                  setLeadSearch={setLeadSearch}
                  leadForm={leadForm}
                  setLeadForm={setLeadForm}
                  saveLead={saveLead}
                  deleteLead={deleteLead}
                  editingLead={editingLead}
                  setEditingLead={
                    setEditingLead
                  }
                  startLeadEdit={
                    startLeadEdit
                  }
                />
              )}

              {active === "Products" && (
                <ProductsPage
                  products={products}
                  filteredProducts={
                    filteredProducts
                  }
                  productSearch={
                    productSearch
                  }
                  setProductSearch={
                    setProductSearch
                  }
                  productForm={productForm}
                  setProductForm={
                    setProductForm
                  }
                  saveProduct={
                    saveProduct
                  }
                  deleteProduct={
                    deleteProduct
                  }
                  editingProduct={
                    editingProduct
                  }
                  setEditingProduct={
                    setEditingProduct
                  }
                  startProductEdit={
                    startProductEdit
                  }
                />
              )}

              {active === "Orders" && (
                <OrdersPage
                  orders={orders}
                  filteredOrders={
                    filteredOrders
                  }
                  orderSearch={
                    orderSearch
                  }
                  setOrderSearch={
                    setOrderSearch
                  }
                  orderForm={orderForm}
                  setOrderForm={
                    setOrderForm
                  }
                  saveOrder={saveOrder}
                  deleteOrder={
                    deleteOrder
                  }
                  editingOrder={
                    editingOrder
                  }
                  setEditingOrder={
                    setEditingOrder
                  }
                  startOrderEdit={
                    startOrderEdit
                  }
                />
              )}

              {active === "Tasks" && (
                <TasksPage
                  tasks={tasks}
                  pendingTasks={
                    pendingTasks
                  }
                  completedTasks={
                    completedTasks
                  }
                  taskForm={taskForm}
                  setTaskForm={
                    setTaskForm
                  }
                  saveTask={saveTask}
                  editingTask={
                    editingTask
                  }
                  setEditingTask={
                    setEditingTask
                  }
                  startTaskEdit={
                    startTaskEdit
                  }
                  toggleTask={
                    toggleTask
                  }
                  deleteTask={
                    deleteTask
                  }
                />
              )}

              {active === "WhatsApp" && (
                <WhatsAppPage
                  leads={leads}
                  whatsappLeadId={
                    whatsappLeadId
                  }
                  setWhatsappLeadId={
                    setWhatsappLeadId
                  }
                  selectedLead={
                    selectedWhatsappLead
                  }
                  whatsappMessage={
                    whatsappMessage
                  }
                  setWhatsappMessage={
                    setWhatsappMessage
                  }
                  whatsappSending={
                    whatsappSending
                  }
                  sendWhatsApp={
                    sendWhatsApp
                  }
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Dashboard({
  revenue,
  inventoryValue,
  leads,
  products,
  orders,
  pendingTasks,
  completedTasks,
  lowStockProducts,
  setActive,
}: {
  revenue: number;
  inventoryValue: number;
  leads: Lead[];
  products: Product[];
  orders: Order[];
  pendingTasks: number;
  completedTasks: number;
  lowStockProducts: Product[];
  setActive: (
    value: string
  ) => void;
}) {
  const convertedLeads =
    leads.filter(
      (lead) =>
        lead.status ===
        "Converted"
    ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          Business Dashboard
        </h2>
        <p className="mt-1 text-slate-500">
          FreshCut live business overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Revenue"
          value={`â‚¹${revenue}`}
        />
        <Card
          title="Inventory"
          value={`â‚¹${inventoryValue}`}
        />
        <Card
          title="Leads"
          value={String(
            leads.length
          )}
        />
        <Card
          title="Orders"
          value={String(
            orders.length
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniCard
          title="Converted Leads"
          value={convertedLeads}
        />
        <MiniCard
          title="Pending Tasks"
          value={pendingTasks}
        />
        <MiniCard
          title="Completed Tasks"
          value={completedTasks}
        />
        <MiniCard
          title="Low Stock"
          value={
            lowStockProducts.length
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl bg-white p-5">
          <h3 className="mb-4 text-xl font-bold">
            Recent Leads
          </h3>

          {leads.slice(0, 5).map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between border-b py-3 last:border-b-0"
            >
              <div>
                <div className="font-semibold">
                  {lead.name}
                </div>
                <div className="text-sm text-slate-500">
                  {lead.phone}
                </div>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                {lead.status}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white p-5">
          <h3 className="mb-4 text-xl font-bold">
            Recent Orders
          </h3>

          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b py-3 last:border-b-0"
            >
              <div>
                <div className="font-semibold">
                  {order.customer}
                </div>
                <div className="text-sm text-slate-500">
                  {order.status}
                </div>
              </div>

              <div className="font-bold">
                â‚¹{order.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <QuickAction
          text="Manage Leads"
          onClick={() => setActive("Leads")}
        />
        <QuickAction
          text="Manage Products"
          onClick={() =>
            setActive("Products")
          }
        />
        <QuickAction
          text="Manage Orders"
          onClick={() =>
            setActive("Orders")
          }
        />
        <QuickAction
          text="WhatsApp Inbox"
          onClick={() =>
            setActive("WhatsApp")
          }
        />
      </div>
    </div>
  );
}

function LeadsPage({
  leads,
  filteredLeads,
  leadSearch,
  setLeadSearch,
  leadForm,
  setLeadForm,
  saveLead,
  deleteLead,
  editingLead,
  setEditingLead,
  startLeadEdit,
}: {
  leads: Lead[];
  filteredLeads: Lead[];
  leadSearch: string;
  setLeadSearch: (
    value: string
  ) => void;
  leadForm: {
    name: string;
    phone: string;
    area: string;
    source: string;
    interest: string;
    status: string;
    value: string;
    nextFollowUp: string;
  };
  setLeadForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      phone: string;
      area: string;
      source: string;
      interest: string;
      status: string;
      value: string;
      nextFollowUp: string;
    }>
  >;
  saveLead: () => void;
  deleteLead: (
    id: number
  ) => void;
  editingLead: Lead | null;
  setEditingLead: (
    lead: Lead | null
  ) => void;
  startLeadEdit: (
    lead: Lead
  ) => void;
}) {
  const converted = leads.filter(
    (lead) =>
      lead.status ===
      "Converted"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          Lead Management
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniCard
          title="Total"
          value={leads.length}
        />
        <MiniCard
          title="New"
          value={
            leads.filter(
              (lead) =>
                lead.status ===
                "New"
            ).length
          }
        />
        <MiniCard
          title="Trial"
          value={
            leads.filter(
              (lead) =>
                lead.status ===
                "Trial"
            ).length
          }
        />
        <MiniCard
          title="Converted"
          value={converted}
        />
      </div>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-4 text-xl font-bold">
          {editingLead
            ? "Edit Lead"
            : "Add Lead"}
        </h3>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Name"
            value={leadForm.name}
            onChange={(value) =>
              setLeadForm((prev) => ({
                ...prev,
                name: value,
              }))
            }
          />

          <Input
            placeholder="Phone"
            value={leadForm.phone}
            onChange={(value) =>
              setLeadForm((prev) => ({
                ...prev,
                phone: value,
              }))
            }
          />

          <Input
            placeholder="Area"
            value={leadForm.area}
            onChange={(value) =>
              setLeadForm((prev) => ({
                ...prev,
                area: value,
              }))
            }
          />

          <Input
            placeholder="Source"
            value={leadForm.source}
            onChange={(value) =>
              setLeadForm((prev) => ({
                ...prev,
                source: value,
              }))
            }
          />

          <Input
            placeholder="Interest"
            value={leadForm.interest}
            onChange={(value) =>
              setLeadForm((prev) => ({
                ...prev,
                interest: value,
              }))
            }
          />

          <Input
            placeholder="Value"
            type="number"
            value={leadForm.value}
            onChange={(value) =>
              setLeadForm((prev) => ({
                ...prev,
                value,
              }))
            }
          />

          <Input
            placeholder="Next Follow-up"
            value={
              leadForm.nextFollowUp
            }
            onChange={(value) =>
              setLeadForm((prev) => ({
                ...prev,
                nextFollowUp: value,
              }))
            }
          />

          <select
            className="rounded-lg border border-slate-300 bg-white p-3"
            value={leadForm.status}
            onChange={(event) =>
              setLeadForm((prev) => ({
                ...prev,
                status:
                  event.target.value,
              }))
            }
          >
            {leadStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={saveLead}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
          >
            {editingLead
              ? "Update Lead"
              : "Save Lead"}
          </button>

          {editingLead && (
            <button
              onClick={() => {
                setEditingLead(
                  null
                );

                setLeadForm({
                  name: "",
                  phone: "",
                  area: "",
                  source: "",
                  interest: "",
                  status: "New",
                  value: "",
                  nextFollowUp: "",
                });
              }}
              className="rounded-lg bg-slate-500 px-5 py-3 font-semibold text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-lg border border-slate-300 p-3"
            placeholder="Search leads..."
            value={leadSearch}
            onChange={(event) =>
              setLeadSearch(
                event.target.value
              )
            }
          />

          <button
            onClick={() =>
              exportLeadsCSV(leads)
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">
                  Name
                </th>
                <th className="p-3 text-left">
                  Phone
                </th>
                <th className="p-3 text-left">
                  Area
                </th>
                <th className="p-3 text-left">
                  Status
                </th>
                <th className="p-3 text-left">
                  Value
                </th>
                <th className="p-3 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLeads.map(
                (lead) => (
                  <tr
                    key={lead.id}
                    className="border-t"
                  >
                    <td className="p-3 font-semibold">
                      {lead.name}
                    </td>

                    <td className="p-3">
                      {lead.phone}
                    </td>

                    <td className="p-3">
                      {lead.area}
                    </td>

                    <td className="p-3">
                      {lead.status}
                    </td>

                    <td className="p-3">
                      â‚¹{lead.value}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startLeadEdit(
                              lead
                            )
                          }
                          className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteLead(
                              lead.id
                            )
                          }
                          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({
  products,
  filteredProducts,
  productSearch,
  setProductSearch,
  productForm,
  setProductForm,
  saveProduct,
  deleteProduct,
  editingProduct,
  setEditingProduct,
  startProductEdit,
}: {
  products: Product[];
  filteredProducts: Product[];
  productSearch: string;
  setProductSearch: (
    value: string
  ) => void;
  productForm: {
    name: string;
    category: string;
    pack: string;
    price: string;
    stock: string;
  };
  setProductForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      category: string;
      pack: string;
      price: string;
      stock: string;
    }>
  >;
  saveProduct: () => void;
  deleteProduct: (
    id: number
  ) => void;
  editingProduct: Product | null;
  setEditingProduct: (
    product: Product | null
  ) => void;
  startProductEdit: (
    product: Product
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          Products
        </h2>
      </div>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-4 text-xl font-bold">
          {editingProduct
            ? "Edit Product"
            : "Add Product"}
        </h3>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            placeholder="Name"
            value={
              productForm.name
            }
            onChange={(value) =>
              setProductForm(
                (prev) => ({
                  ...prev,
                  name: value,
                })
              )
            }
          />

          <Input
            placeholder="Category"
            value={
              productForm.category
            }
            onChange={(value) =>
              setProductForm(
                (prev) => ({
                  ...prev,
                  category:
                    value,
                })
              )
            }
          />

          <Input
            placeholder="Pack"
            value={
              productForm.pack
            }
            onChange={(value) =>
              setProductForm(
                (prev) => ({
                  ...prev,
                  pack: value,
                })
              )
            }
          />

          <Input
            placeholder="Price"
            type="number"
            value={
              productForm.price
            }
            onChange={(value) =>
              setProductForm(
                (prev) => ({
                  ...prev,
                  price: value,
                })
              )
            }
          />

          <Input
            placeholder="Stock"
            type="number"
            value={
              productForm.stock
            }
            onChange={(value) =>
              setProductForm(
                (prev) => ({
                  ...prev,
                  stock: value,
                })
              )
            }
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={saveProduct}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
          >
            {editingProduct
              ? "Update Product"
              : "Save Product"}
          </button>

          {editingProduct && (
            <button
              onClick={() => {
                setEditingProduct(
                  null
                );

                setProductForm({
                  name: "",
                  category: "",
                  pack: "",
                  price: "",
                  stock: "",
                });
              }}
              className="rounded-lg bg-slate-500 px-5 py-3 font-semibold text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-lg border border-slate-300 p-3"
            placeholder="Search products..."
            value={
              productSearch
            }
            onChange={(event) =>
              setProductSearch(
                event.target.value
              )
            }
          />

          <button
            onClick={() =>
              exportProductsCSV(
                products
              )
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">
                  Name
                </th>
                <th className="p-3 text-left">
                  Category
                </th>
                <th className="p-3 text-left">
                  Pack
                </th>
                <th className="p-3 text-left">
                  Price
                </th>
                <th className="p-3 text-left">
                  Stock
                </th>
                <th className="p-3 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(
                (product) => (
                  <tr
                    key={
                      product.id
                    }
                    className="border-t"
                  >
                    <td className="p-3 font-semibold">
                      {product.name}
                    </td>

                    <td className="p-3">
                      {product.category}
                    </td>

                    <td className="p-3">
                      {product.pack}
                    </td>

                    <td className="p-3">
                      â‚¹{product.price}
                    </td>

                    <td className="p-3">
                      {product.stock}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startProductEdit(
                              product
                            )
                          }
                          className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(
                              product.id
                            )
                          }
                          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersPage({
  orders,
  filteredOrders,
  orderSearch,
  setOrderSearch,
  orderForm,
  setOrderForm,
  saveOrder,
  deleteOrder,
  editingOrder,
  setEditingOrder,
  startOrderEdit,
}: {
  orders: Order[];
  filteredOrders: Order[];
  orderSearch: string;
  setOrderSearch: (
    value: string
  ) => void;
  orderForm: {
    customer: string;
    amount: string;
    status: string;
  };
  setOrderForm: React.Dispatch<
    React.SetStateAction<{
      customer: string;
      amount: string;
      status: string;
    }>
  >;
  saveOrder: () => void;
  deleteOrder: (
    id: number
  ) => void;
  editingOrder: Order | null;
  setEditingOrder: (
    order: Order | null
  ) => void;
  startOrderEdit: (
    order: Order
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          Orders
        </h2>
      </div>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-4 text-xl font-bold">
          {editingOrder
            ? "Edit Order"
            : "Create Order"}
        </h3>

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Customer"
            value={
              orderForm.customer
            }
            onChange={(value) =>
              setOrderForm(
                (prev) => ({
                  ...prev,
                  customer:
                    value,
                })
              )
            }
          />

          <Input
            placeholder="Amount"
            type="number"
            value={
              orderForm.amount
            }
            onChange={(value) =>
              setOrderForm(
                (prev) => ({
                  ...prev,
                  amount: value,
                })
              )
            }
          />

          <select
            className="rounded-lg border border-slate-300 bg-white p-3"
            value={
              orderForm.status
            }
            onChange={(event) =>
              setOrderForm(
                (prev) => ({
                  ...prev,
                  status:
                    event.target
                      .value,
                })
              )
            }
          >
            {orderStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={saveOrder}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
          >
            {editingOrder
              ? "Update Order"
              : "Save Order"}
          </button>

          {editingOrder && (
            <button
              onClick={() => {
                setEditingOrder(
                  null
                );

                setOrderForm({
                  customer: "",
                  amount: "",
                  status:
                    "Pending",
                });
              }}
              className="rounded-lg bg-slate-500 px-5 py-3 font-semibold text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-lg border border-slate-300 p-3"
            placeholder="Search orders..."
            value={
              orderSearch
            }
            onChange={(event) =>
              setOrderSearch(
                event.target
                  .value
              )
            }
          />

          <button
            onClick={() =>
              exportOrdersCSV(
                orders
              )
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[750px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">
                  ID
                </th>
                <th className="p-3 text-left">
                  Customer
                </th>
                <th className="p-3 text-left">
                  Amount
                </th>
                <th className="p-3 text-left">
                  Status
                </th>
                <th className="p-3 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(
                (order) => (
                  <tr
                    key={
                      order.id
                    }
                    className="border-t"
                  >
                    <td className="p-3">
                      {order.id}
                    </td>

                    <td className="p-3 font-semibold">
                      {
                        order.customer
                      }
                    </td>

                    <td className="p-3">
                      â‚¹{order.amount}
                    </td>

                    <td className="p-3">
                      {
                        order.status
                      }
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            startOrderEdit(
                              order
                            )
                          }
                          className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteOrder(
                              order.id
                            )
                          }
                          className="rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TasksPage({
  tasks,
  pendingTasks,
  completedTasks,
  taskForm,
  setTaskForm,
  saveTask,
  editingTask,
  setEditingTask,
  startTaskEdit,
  toggleTask,
  deleteTask,
}: {
  tasks: Task[];
  pendingTasks: number;
  completedTasks: number;
  taskForm: {
    title: string;
    customer: string;
    due: string;
    type: string;
    done: boolean;
  };
  setTaskForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      customer: string;
      due: string;
      type: string;
      done: boolean;
    }>
  >;
  saveTask: () => void;
  editingTask: Task | null;
  setEditingTask: (
    task: Task | null
  ) => void;
  startTaskEdit: (
    task: Task
  ) => void;
  toggleTask: (
    id: number
  ) => void;
  deleteTask: (
    id: number
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          Tasks & Follow-ups
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          title="Pending"
          value={String(
            pendingTasks
          )}
        />
        <Card
          title="Completed"
          value={String(
            completedTasks
          )}
        />
      </div>

      <div className="rounded-xl bg-white p-5">
        <h3 className="mb-4 text-xl font-bold">
          {editingTask
            ? "Edit Task"
            : "Add Task"}
        </h3>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Task title"
            value={taskForm.title}
            onChange={(value) =>
              setTaskForm(
                (prev) => ({
                  ...prev,
                  title:
                    value,
                })
              )
            }
          />

          <Input
            placeholder="Customer"
            value={
              taskForm.customer
            }
            onChange={(value) =>
              setTaskForm(
                (prev) => ({
                  ...prev,
                  customer:
                    value,
                })
              )
            }
          />

          <Input
            placeholder="Due"
            value={taskForm.due}
            onChange={(value) =>
              setTaskForm(
                (prev) => ({
                  ...prev,
                  due: value,
                })
              )
            }
          />

          <select
            className="rounded-lg border border-slate-300 bg-white p-3"
            value={taskForm.type}
            onChange={(event) =>
              setTaskForm(
                (prev) => ({
                  ...prev,
                  type:
                    event.target
                      .value,
                })
              )
            }
          >
            {taskTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              )
            )}
          </select>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={saveTask}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
          >
            {editingTask
              ? "Update Task"
              : "Save Task"}
          </button>

          {editingTask && (
            <button
              onClick={() => {
                setEditingTask(
                  null
                );

                setTaskForm({
                  title: "",
                  customer: "",
                  due: "",
                  type: "Task",
                  done: false,
                });
              }}
              className="rounded-lg bg-slate-500 px-5 py-3 font-semibold text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() =>
            exportTasksCSV(tasks)
          }
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col gap-4 rounded-xl bg-white p-5 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="font-bold">
                {task.title}
              </div>

              <div className="text-sm text-slate-500">
                {task.customer} {" "}
                {task.due} {" "}
                {task.type}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  toggleTask(
                    task.id
                  )
                }
                className={`rounded-lg px-4 py-2 font-semibold text-white ${
                  task.done
                    ? "bg-slate-500"
                    : "bg-green-600"
                }`}
              >
                {task.done
                  ? "Completed"
                  : "Mark Done"}
              </button>

              <button
                onClick={() =>
                  startTaskEdit(
                    task
                  )
                }
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  deleteTask(
                    task.id
                  )
                }
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppPage({
  leads,
  whatsappLeadId,
  setWhatsappLeadId,
  selectedLead,
  whatsappMessage,
  setWhatsappMessage,
  whatsappSending,
  sendWhatsApp,
}: {
  leads: Lead[];
  whatsappLeadId: number | "";
  setWhatsappLeadId: (
    value: number | ""
  ) => void;
  selectedLead:
    | Lead
    | undefined;
  whatsappMessage: string;
  setWhatsappMessage: (
    value: string
  ) => void;
  whatsappSending: boolean;
  sendWhatsApp: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">
          WhatsApp
        </h2>
        <p className="mt-1 text-slate-500">
          Send WhatsApp messages to CRM leads.
        </p>
      </div>

      <div className="rounded-xl bg-white p-5">
        <div className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          WhatsApp API credentials must be configured
          in <strong>.env.local</strong> before messages
          can be sent.
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Select Lead
            </label>

            <select
              className="w-full rounded-lg border border-slate-300 bg-white p-3"
              value={whatsappLeadId}
              onChange={(event) =>
                setWhatsappLeadId(
                  event.target.value
                    ? Number(event.target.value)
                    : ""
                )
              }
            >
              <option value="">
                Select a lead
              </option>

              {leads.map((lead) => (
                <option
                  key={lead.id}
                  value={lead.id}
                >
                  {lead.name} - {lead.phone}
                </option>
              ))}
            </select>

            {selectedLead && (
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <div className="font-bold">
                  {selectedLead.name}
                </div>
                <div className="text-sm text-slate-500">
                  {selectedLead.phone}
                </div>
                <div className="text-sm text-slate-500">
                  {selectedLead.area}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Message
            </label>

            <textarea
              className="min-h-[180px] w-full rounded-lg border border-slate-300 p-3"
              value={whatsappMessage}
              onChange={(event) =>
                setWhatsappMessage(
                  event.target.value
                )
              }
              placeholder="Type your WhatsApp message..."
            />

            <button
              onClick={sendWhatsApp}
              disabled={
                whatsappSending ||
                !whatsappLeadId
              }
              className="mt-3 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {whatsappSending
                ? "Sending..."
                : "Send WhatsApp Message"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniCard
          title="CRM Leads"
          value={leads.length}
        />

        <MiniCard
          title="WhatsApp Ready"
          value={
            leads.filter(
              (lead) =>
                Boolean(
                  lead.phone
                )
            ).length
          }
        />

        <MiniCard
          title="Selected Lead"
          value={
            selectedLead ? 1 : 0
          }
        />
      </div>
    </div>
  );
}

function QuickAction({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-slate-900 p-4 text-left font-semibold text-white hover:bg-slate-800"
    >
      {text}
    </button>
  );
}

function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      className="rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-green-600"
      placeholder={placeholder}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
    />
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="text-sm font-semibold text-slate-500">
        {title}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>
    </div>
  );
}

function MiniCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">
        {title}
      </div>

      <div className="mt-2 text-2xl font-bold">
        {value}
      </div>
    </div>
  );
}





