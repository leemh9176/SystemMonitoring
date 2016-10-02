namespace Data_Collector_Win_Form_ver
{
    partial class Form1
    {
        /// <summary>
        /// 필수 디자이너 변수입니다.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 사용 중인 모든 리소스를 정리합니다.
        /// </summary>
        /// <param name="disposing">관리되는 리소스를 삭제해야 하면 true이고, 그렇지 않으면 false입니다.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form 디자이너에서 생성한 코드

        /// <summary>
        /// 디자이너 지원에 필요한 메서드입니다. 
        /// 이 메서드의 내용을 코드 편집기로 수정하지 마세요.
        /// </summary>
        private void InitializeComponent()
        {
            this.tatle = new System.Windows.Forms.Label();
            this.program_status_lbl = new System.Windows.Forms.Label();
            this.user_id_lbl = new System.Windows.Forms.Label();
            this.user_pw_lbl = new System.Windows.Forms.Label();
            this.user_id_txt = new System.Windows.Forms.TextBox();
            this.user_pw_txt = new System.Windows.Forms.TextBox();
            this.user_chk_btn = new System.Windows.Forms.Button();
            this.Send_btn = new System.Windows.Forms.Button();
            this.Stop_btn = new System.Windows.Forms.Button();
            this.program_status_txt = new System.Windows.Forms.TextBox();
            this.SuspendLayout();
            // 
            // tatle
            // 
            this.tatle.AutoSize = true;
            this.tatle.Font = new System.Drawing.Font("굴림", 27.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.tatle.Location = new System.Drawing.Point(0, 9);
            this.tatle.Name = "tatle";
            this.tatle.Size = new System.Drawing.Size(433, 37);
            this.tatle.TabIndex = 0;
            this.tatle.Text = "Window Data Collector";
            // 
            // program_status_lbl
            // 
            this.program_status_lbl.AutoSize = true;
            this.program_status_lbl.Font = new System.Drawing.Font("굴림", 18F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.program_status_lbl.Location = new System.Drawing.Point(3, 67);
            this.program_status_lbl.Name = "program_status_lbl";
            this.program_status_lbl.Size = new System.Drawing.Size(169, 24);
            this.program_status_lbl.TabIndex = 2;
            this.program_status_lbl.Text = "프로그램 상태";
            // 
            // user_id_lbl
            // 
            this.user_id_lbl.AutoSize = true;
            this.user_id_lbl.Font = new System.Drawing.Font("굴림", 18F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.user_id_lbl.Location = new System.Drawing.Point(11, 264);
            this.user_id_lbl.Name = "user_id_lbl";
            this.user_id_lbl.Size = new System.Drawing.Size(31, 24);
            this.user_id_lbl.TabIndex = 3;
            this.user_id_lbl.Text = "ID";
            // 
            // user_pw_lbl
            // 
            this.user_pw_lbl.AutoSize = true;
            this.user_pw_lbl.Font = new System.Drawing.Font("굴림", 18F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.user_pw_lbl.Location = new System.Drawing.Point(11, 299);
            this.user_pw_lbl.Name = "user_pw_lbl";
            this.user_pw_lbl.Size = new System.Drawing.Size(119, 24);
            this.user_pw_lbl.TabIndex = 4;
            this.user_pw_lbl.Text = "Password";
            // 
            // user_id_txt
            // 
            this.user_id_txt.Font = new System.Drawing.Font("굴림", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.user_id_txt.Location = new System.Drawing.Point(150, 264);
            this.user_id_txt.Name = "user_id_txt";
            this.user_id_txt.Size = new System.Drawing.Size(209, 25);
            this.user_id_txt.TabIndex = 5;
            // 
            // user_pw_txt
            // 
            this.user_pw_txt.Font = new System.Drawing.Font("굴림", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.user_pw_txt.Location = new System.Drawing.Point(150, 299);
            this.user_pw_txt.Name = "user_pw_txt";
            this.user_pw_txt.PasswordChar = '*';
            this.user_pw_txt.Size = new System.Drawing.Size(209, 25);
            this.user_pw_txt.TabIndex = 6;
            // 
            // user_chk_btn
            // 
            this.user_chk_btn.Font = new System.Drawing.Font("굴림", 18F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.user_chk_btn.Location = new System.Drawing.Point(366, 264);
            this.user_chk_btn.Name = "user_chk_btn";
            this.user_chk_btn.Size = new System.Drawing.Size(75, 59);
            this.user_chk_btn.TabIndex = 7;
            this.user_chk_btn.Text = "확인";
            this.user_chk_btn.UseVisualStyleBackColor = true;
            this.user_chk_btn.Click += new System.EventHandler(this.user_chk_btn_Click);
            // 
            // Send_btn
            // 
            this.Send_btn.Cursor = System.Windows.Forms.Cursors.Hand;
            this.Send_btn.Enabled = false;
            this.Send_btn.Font = new System.Drawing.Font("굴림", 18F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.Send_btn.Location = new System.Drawing.Point(11, 338);
            this.Send_btn.Name = "Send_btn";
            this.Send_btn.Size = new System.Drawing.Size(134, 78);
            this.Send_btn.TabIndex = 8;
            this.Send_btn.Text = "전송";
            this.Send_btn.UseVisualStyleBackColor = true;
            this.Send_btn.Click += new System.EventHandler(this.Send_btn_Click);
            // 
            // Stop_btn
            // 
            this.Stop_btn.Enabled = false;
            this.Stop_btn.Font = new System.Drawing.Font("굴림", 18F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.Stop_btn.Location = new System.Drawing.Point(313, 338);
            this.Stop_btn.Name = "Stop_btn";
            this.Stop_btn.Size = new System.Drawing.Size(134, 78);
            this.Stop_btn.TabIndex = 9;
            this.Stop_btn.Text = "중지";
            this.Stop_btn.UseVisualStyleBackColor = true;
            this.Stop_btn.Click += new System.EventHandler(this.Stop_btn_Click);
            // 
            // program_status_txt
            // 
            this.program_status_txt.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.program_status_txt.Font = new System.Drawing.Font("굴림", 14.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(129)));
            this.program_status_txt.Location = new System.Drawing.Point(7, 95);
            this.program_status_txt.Multiline = true;
            this.program_status_txt.Name = "program_status_txt";
            this.program_status_txt.ReadOnly = true;
            this.program_status_txt.ScrollBars = System.Windows.Forms.ScrollBars.Horizontal;
            this.program_status_txt.Size = new System.Drawing.Size(440, 163);
            this.program_status_txt.TabIndex = 10;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(456, 428);
            this.Controls.Add(this.program_status_txt);
            this.Controls.Add(this.Stop_btn);
            this.Controls.Add(this.Send_btn);
            this.Controls.Add(this.user_chk_btn);
            this.Controls.Add(this.user_pw_txt);
            this.Controls.Add(this.user_id_txt);
            this.Controls.Add(this.user_pw_lbl);
            this.Controls.Add(this.user_id_lbl);
            this.Controls.Add(this.program_status_lbl);
            this.Controls.Add(this.tatle);
            this.Name = "Form1";
            this.Text = "Form1";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Form1_FormClosing);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label tatle;
        private System.Windows.Forms.Label program_status_lbl;
        private System.Windows.Forms.Label user_id_lbl;
        private System.Windows.Forms.Label user_pw_lbl;
        private System.Windows.Forms.TextBox user_id_txt;
        private System.Windows.Forms.TextBox user_pw_txt;
        private System.Windows.Forms.Button user_chk_btn;
        private System.Windows.Forms.Button Send_btn;
        private System.Windows.Forms.Button Stop_btn;
        public System.Windows.Forms.TextBox program_status_txt;
    }
}

