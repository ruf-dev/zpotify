package background

type Worker struct {
	tasks []Task
}

type Task interface {
	Start()
	Stop()
}

func New(tasks ...Task) *Worker {
	return &Worker{
		tasks: tasks,
	}
}

func (w *Worker) Start() error {
	for _, task := range w.tasks {
		task.Start()
	}

	return nil
}

func (w *Worker) Stop() error {
	for _, t := range w.tasks {
		t.Stop()
	}

	return nil
}
