import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Bot, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/admin/agents')({
  component: AgentsAdmin,
})

const agentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatarUrl: z.string().url('Must be a valid URL'),
  personality: z.string().min(1, 'Personality is required'),
  backstory: z.string().min(1, 'Backstory is required'),
  instructions: z.string().min(1, 'Instructions are required'),
})

type AgentFormData = z.infer<typeof agentFormSchema>

type Agent = {
  _id: Id<'agents'>
  _creationTime: number
  name: string
  avatarUrl: string
  personality: string
  backstory: string
  instructions: string
}

function AgentsAdmin() {
  const agents = useQuery(api.agents.list)
  const createAgent = useMutation(api.agents.create)
  const updateAgent = useMutation(api.agents.update)
  const deleteAgent = useMutation(api.agents.remove)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const handleCreate = () => {
    setEditingAgent(null)
    setDialogOpen(true)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setDialogOpen(true)
  }

  const handleDelete = async (id: Id<'agents'>) => {
    await deleteAgent({ id })
  }

  const handleSave = async (data: AgentFormData) => {
    if (editingAgent) {
      await updateAgent({ id: editingAgent._id, ...data })
    } else {
      await createAgent(data)
    }
    setDialogOpen(false)
    setEditingAgent(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground mt-1">
            Manage the AI personalities that respond to blog posts
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4" /> New Agent
        </Button>
      </div>

      {agents === undefined ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Bot className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No agents yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first AI agent to start generating comments
          </p>
          <Button onClick={handleCreate}>
            <Plus className="size-4" /> Create Agent
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="group relative border rounded-xl p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img
                  src={agent.avatarUrl}
                  alt={agent.name}
                  className="size-14 rounded-full object-cover ring-2 ring-border"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {agent.personality}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(agent)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDeleteDialog
                    onConfirm={() => handleDelete(agent._id)}
                    title="Delete agent?"
                    description="This will permanently delete this AI agent. Any existing comments from this agent will remain."
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </ConfirmDeleteDialog>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Backstory:
                  </span>
                  <p className="mt-1 line-clamp-2">{agent.backstory}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Instructions:
                  </span>
                  <p className="mt-1 line-clamp-2">{agent.instructions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={editingAgent}
        onSave={handleSave}
      />
    </div>
  )
}

interface AgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSave: (data: AgentFormData) => Promise<void>
}

function AgentDialog({ open, onOpenChange, agent, onSave }: AgentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
      personality: '',
      backstory: '',
      instructions: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (agent) {
        reset({
          name: agent.name,
          avatarUrl: agent.avatarUrl,
          personality: agent.personality,
          backstory: agent.backstory,
          instructions: agent.instructions,
        })
      } else {
        reset({
          name: '',
          avatarUrl: '',
          personality: '',
          backstory: '',
          instructions: '',
        })
      }
    }
  }, [open, agent, reset])

  const onSubmit = async (data: AgentFormData) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
          <DialogDescription>
            {agent
              ? 'Update the AI agent personality and behavior.'
              : 'Define a new AI persona that will engage with blog posts.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Luna the Thoughtful"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatarUrl')}
                aria-invalid={!!errors.avatarUrl}
              />
              {errors.avatarUrl && (
                <p className="text-sm text-destructive">
                  {errors.avatarUrl.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Textarea
              id="personality"
              placeholder="Describe the agent's personality traits and communication style..."
              rows={3}
              {...register('personality')}
              aria-invalid={!!errors.personality}
            />
            {errors.personality && (
              <p className="text-sm text-destructive">
                {errors.personality.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              How this agent speaks and interacts. E.g., "Warm, empathetic, uses
              gentle humor"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backstory">Backstory</Label>
            <Textarea
              id="backstory"
              placeholder="Give the agent a background story that shapes their perspective..."
              rows={3}
              {...register('backstory')}
              aria-invalid={!!errors.backstory}
            />
            {errors.backstory && (
              <p className="text-sm text-destructive">
                {errors.backstory.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Their fictional background. E.g., "A retired librarian who loves
              hearing people's stories"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Specific instructions for how the agent should respond to posts..."
              rows={4}
              {...register('instructions')}
              aria-invalid={!!errors.instructions}
            />
            {errors.instructions && (
              <p className="text-sm text-destructive">
                {errors.instructions.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              System-level guidance. E.g., "Always acknowledge the writer's
              feelings before offering perspective"
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {agent ? 'Save Changes' : 'Create Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
