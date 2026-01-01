import { Component, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { TaskService } from '../../../../../services/task.service'
import { TableComponent } from '../../../../../theme/shared/components/table/table.component'

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, TableComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export default class TaskListComponent implements OnInit {
  tasks: any[] = []

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks(1, 10)
  }

  loadTasks(page: number, perPage: number) {
    this.taskService.list(page, perPage).subscribe((response) => {
      this.tasks = response.tasks
    })
  }

  columns = [
    { key: 'id', label: 'ID' },
    { key: 'task_name', label: 'Title' },
    { key: 'status', label: 'Status' },
  ]
}
