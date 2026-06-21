package async

type Task interface {
	Start()
	Stop()
}

type Pool struct {
	tasks []Task
}

func New(tasks ...Task) *Pool {
	return &Pool{
		tasks: tasks,
	}
}

func (p *Pool) Start() error {
	for _, t := range p.tasks {
		t.Start()
	}
	return nil
}

func (p *Pool) Stop() error {
	for _, t := range p.tasks {
		t.Stop()
	}
	return nil
}
