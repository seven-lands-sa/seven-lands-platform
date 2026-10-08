"""Drive Payload's interactive `migrate:create` prompts inside a real PTY (see Phase D §43).

Drizzle's diff asks "Is <table> created or renamed from another table?" whenever a new table appears
next to a similar-looking one. For Phase D the answer is always the first option (create table).
This driver presses Enter at every prompt occurrence and logs the session as evidence.
"""
import os, pty, select, sys, time

pid, fd = pty.fork()
if pid == 0:
    os.chdir("/home/user/seven-lands-website")
    os.execvp("npx", ["npx", "payload", "migrate:create", "phase_e_shared_sections"])

log = []
answered = 0
deadline = time.time() + 240
while time.time() < deadline:
    r, _, _ = select.select([fd], [], [], 0.5)
    if r:
        try:
            chunk = os.read(fd, 4096).decode("utf-8", "replace")
        except OSError:
            break
        if not chunk:
            break
        log.append(chunk)
        sys.stdout.write(chunk)
        sys.stdout.flush()

    text = "".join(log)
    pending = text.count("created or renamed")
    if pending > answered:
        answered += 1
        time.sleep(0.3)
        os.write(fd, b"\r")

    done, _ = os.waitpid(pid, os.WNOHANG)
    if done:
        # drain the rest
        time.sleep(0.3)
        try:
            while True:
                chunk = os.read(fd, 4096).decode("utf-8", "replace")
                if not chunk:
                    break
                log.append(chunk)
                sys.stdout.write(chunk)
        except OSError:
            pass
        break

print(f"\n[driver] prompts answered: {answered}")
