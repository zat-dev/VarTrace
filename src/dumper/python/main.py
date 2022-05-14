import traceback
import atexit
import os
import sys
import signal
from dump_handler import DumpHandler
from config import Config

version = "0.0.2"


def imitate_sys(config: Config):
    # imitate direct execution main_file
    sys.path[0] = os.path.dirname(config.main)
    sys.argv[:] = [config.main] + config.args  # args passed to main_file


def main():
    config = Config()

    imitate_sys(config)

    if config.module_mode:
        import runpy
        mod_name, mod_spec, code = runpy._get_module_details(config.main)
        cmd_globals = {
            "__name__": "__main__",
            "__file__": config.main,
            "__package__": mod_name,
            "__loader__": mod_spec.loader,
            "__spec__": mod_spec,
            "__builtins__": __builtins__,
        }
    else:
        with open(config.main, encoding='utf-8') as f:
            src = f.read()
            cmd_globals = {
                '__name__': '__main__',
                "__file__": config.main,
                "__builtins__": __builtins__,
            }
            code = compile(src, config.main, "exec")

    dump_handler = DumpHandler(config)

    def exit_dump():
        dump_handler.finish("exit")
    atexit.register(exit_dump)

    def trace_dispatch(frame, event, arg):
        try:
            if event == 'line':
                dump_handler.dump("line", frame)
            elif event == 'call':
                dump_handler.dump("call", frame)
            elif event == 'return':
                dump_handler.dump("return", frame, arg)
            elif event == 'exception':
                dump_handler.dump("exception", frame, repr(arg[1]))
            # do nothing on c_call, c_exception, c_return
        except Exception as e:
            msg_format = "faital error in vartrace at file: {} line: {}"
            msg = msg_format.format(
                frame.f_code.co_filename,  frame.f_lineno, frame.f_lineno)
            print(msg, file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            exit(1)
        return trace_dispatch

    def sig_handler(signum, frame):
        dump_handler.finish("signal")
        atexit.unregister(exit_dump)
        exit(1)

    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)

    sys.settrace(trace_dispatch)
    exec(code, cmd_globals)


if __name__ == '__main__':
    main()
