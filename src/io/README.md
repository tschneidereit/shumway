# IO layer

Files in this directory are related to input/output and have to run on the mainthread.

They relay user input events to the VM (which might run in a worker), load data that's not loadable in workers, and handle output rendering.
